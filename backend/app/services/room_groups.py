"""Phase 3 workflow around the matching algorithm: who can be matched, running the matching,
the manager's approve / reject decisions, and what each student may see.

All scores come from app/services/matching_service.py; nothing is calculated here.
"""

from datetime import datetime, timezone
UTC = timezone.utc

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.matching import GroupStatus, MatchingRun, RoommateGroup, RoommateGroupMember
from app.models.survey import ResponseStatus, SurveyCategory, SurveyResponse
from app.models.user import RoomType, User, UserRole
from app.schemas.matching import (
    AnswerRow,
    CategoryScoreOut,
    EligibleStudentOut,
    GroupDetailOut,
    GroupOut,
    MatchingOverviewOut,
    PairOut,
    PairScoreOut,
    RoommateGroupDetailOut,
    RoommateGroupOut,
    RunSummary,
    RuleScoreOut,
    StudentMatchingOut,
    StudentRef,
)
from app.services import matching_service as ms

SHARED_ROOMS = (RoomType.DOUBLE, RoomType.TRIPLE, RoomType.QUAD)


# --- Turning algorithm results into API responses --------------------------------------------


class _Context:
    """Names, category titles and questions needed to describe results (loaded once per request)."""

    def __init__(self, db: Session, user_ids: set[int] | None = None):
        query = select(User.id, User.full_name)
        if user_ids is not None:
            query = query.where(User.id.in_(user_ids))
        self.names = dict(db.execute(query).all())
        self.titles = dict(db.execute(select(SurveyCategory.id, SurveyCategory.title)).all())
        self.questions = ms.load_questionnaire(db)

    def ref(self, user_id: int) -> StudentRef:
        return StudentRef(id=user_id, full_name=self.names.get(user_id, "Unknown student"))


def _pair_out(ctx: _Context, pair: ms.PairResult, profiles: dict[int, ms.Answers], first: int | None = None) -> PairOut:
    a, b = pair.student_ids
    if first == b:  # show the asking student on the left
        a, b = b, a
    return PairOut(
        student_1=ctx.ref(a),
        student_2=ctx.ref(b),
        overall_score=pair.overall_score,
        compatibility_level=pair.compatibility_level,
        category_scores=pair.category_scores(),
        categories=[
            CategoryScoreOut(
                category=item.category,
                title=ctx.titles.get(item.category, item.category.title()),
                weight=round(item.weight * 100),
                score=item.score,
                rules=[RuleScoreOut(**rule.__dict__) for rule in item.rules],
                missing_questions=list(item.missing_questions),
            )
            for item in pair.categories
        ],
        complete=pair.complete,
        missing_questions=list(pair.missing_questions),
        answers=[AnswerRow(**row) for row in ms.compare_answers(ctx.questions, profiles.get(a, {}), profiles.get(b, {}))],
    )


def _group_out(ctx: _Context, group: ms.GroupResult) -> GroupOut:
    return GroupOut(
        members=[ctx.ref(member) for member in group.member_ids],
        room_score=group.room_score,
        compatibility_level=group.compatibility_level,
        average_pairs=group.average_pairs,
        worst_pair=group.worst_pair,
        worst_pair_students=[ctx.ref(member) for member in group.worst_pair_ids],
        pair_scores=[
            PairScoreOut(
                student_1=ctx.ref(pair.student_ids[0]),
                student_2=ctx.ref(pair.student_ids[1]),
                overall_score=pair.overall_score,
                compatibility_level=pair.compatibility_level,
            )
            for pair in group.pairs
        ],
        complete=group.complete,
    )


def _roommate_group_out(ctx: _Context, row: RoommateGroup, profiles: dict[int, ms.Answers]) -> RoommateGroupOut:
    result = ms.score_group(profiles, [member.user_id for member in row.members])
    return RoommateGroupOut(
        id=row.id,
        run_id=row.run_id,
        room_type=row.room_type,
        status=row.status,
        created_at=row.created_at,
        decided_at=row.decided_at,
        decided_by=row.decided_by.full_name if row.decided_by else None,
        result=_group_out(ctx, result),
    )


# --- Students ----------------------------------------------------------------------------------


def _eligible_students(db: Session) -> list[tuple[User, SurveyResponse]]:
    """Students who asked for a shared room and submitted the questionnaire."""
    rows = db.execute(
        select(User, SurveyResponse)
        .join(SurveyResponse, SurveyResponse.user_id == User.id)
        .where(
            User.role == UserRole.STUDENT,
            User.room_preference.in_(SHARED_ROOMS),
            SurveyResponse.status == ResponseStatus.SUBMITTED,
        )
        .order_by(User.full_name, User.id)
    ).all()
    return [(user, response) for user, response in rows]


def _active_groups(db: Session) -> list[RoommateGroup]:
    return list(
        db.scalars(
            select(RoommateGroup)
            .where(RoommateGroup.status.in_([GroupStatus.PROPOSED, GroupStatus.APPROVED]))
            .options(selectinload(RoommateGroup.members), selectinload(RoommateGroup.decided_by))
            .order_by(RoommateGroup.room_score.desc(), RoommateGroup.id)
        )
    )


def overview(db: Session) -> MatchingOverviewOut:
    eligible = _eligible_students(db)
    groups = _active_groups(db)
    membership = {member.user_id: group for group in groups for member in group.members}
    member_ids = set(membership) | {user.id for user, _ in eligible}
    profiles = ms.load_profiles(db, member_ids)
    ctx = _Context(db, member_ids)

    students = [
        EligibleStudentOut(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            room_type=user.room_preference,
            submitted_at=response.submitted_at,
            match_status=membership[user.id].status.value if user.id in membership else "waiting",
            group_id=membership[user.id].id if user.id in membership else None,
        )
        for user, response in eligible
    ]
    last = db.scalar(
        select(MatchingRun).options(selectinload(MatchingRun.started_by)).order_by(MatchingRun.id.desc()).limit(1)
    )
    not_submitted = db.scalar(
        select(func.count(User.id))
        .outerjoin(SurveyResponse, SurveyResponse.user_id == User.id)
        .where(
            User.role == UserRole.STUDENT,
            User.room_preference.in_(SHARED_ROOMS),
            SurveyResponse.id.is_(None) | (SurveyResponse.status != ResponseStatus.SUBMITTED),
        )
    )
    return MatchingOverviewOut(
        students=students,
        proposed=[_roommate_group_out(ctx, g, profiles) for g in groups if g.status == GroupStatus.PROPOSED],
        approved=[_roommate_group_out(ctx, g, profiles) for g in groups if g.status == GroupStatus.APPROVED],
        last_run=RunSummary(
            id=last.id,
            created_at=last.created_at,
            started_by=last.started_by.full_name if last.started_by else None,
            eligible_count=last.eligible_count,
            proposed_count=sum(1 for g in groups if g.status == GroupStatus.PROPOSED and g.run_id == last.id),
        )
        if last
        else None,
        waiting_for_questionnaire=not_submitted or 0,
    )


# --- Running the matching ----------------------------------------------------------------------


def run_matching(db: Session, manager: User) -> MatchingOverviewOut:
    """Replaces the open proposals with new ones for every student who is not in an approved room.

    Students are grouped by the room type they asked for (2, 3 or 4 people). Approved rooms are never
    touched; rejected groups stay in the history and their students are matched again.
    """
    for group in db.scalars(select(RoommateGroup).where(RoommateGroup.status == GroupStatus.PROPOSED)):
        db.delete(group)
    db.flush()

    approved = set(
        db.scalars(
            select(RoommateGroupMember.user_id)
            .join(RoommateGroup)
            .where(RoommateGroup.status == GroupStatus.APPROVED)
        )
    )
    candidates = [(user, response) for user, response in _eligible_students(db) if user.id not in approved]
    profiles = ms.load_profiles(db, [user.id for user, _ in candidates])

    run = MatchingRun(started_by_id=manager.id, eligible_count=len(candidates))
    db.add(run)
    db.flush()
    for room_type in SHARED_ROOMS:
        same_type = {user.id: profiles[user.id] for user, _ in candidates if user.room_preference == room_type}
        if len(same_type) < room_type.capacity:
            continue
        for result in ms.build_groups(same_type, room_type.capacity).groups:
            db.add(
                RoommateGroup(
                    run_id=run.id,
                    room_type=room_type,
                    status=GroupStatus.PROPOSED,
                    room_score=result.room_score,
                    average_pairs=result.average_pairs,
                    worst_pair=result.worst_pair,
                    compatibility_level=result.compatibility_level,
                    members=[RoommateGroupMember(user_id=member) for member in result.member_ids],
                )
            )
    db.commit()
    return overview(db)


def _get_group(db: Session, group_id: int) -> RoommateGroup:
    group = db.scalar(
        select(RoommateGroup)
        .where(RoommateGroup.id == group_id)
        .options(selectinload(RoommateGroup.members), selectinload(RoommateGroup.decided_by))
    )
    if group is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This room group does not exist.")
    return group


def decide(db: Session, group_id: int, manager: User, approve: bool) -> RoommateGroupOut:
    group = _get_group(db, group_id)
    if group.status != GroupStatus.PROPOSED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=f"This group is already {group.status.value}."
        )
    member_ids = [member.user_id for member in group.members]
    if approve:
        taken = db.scalar(
            select(RoommateGroupMember.user_id)
            .join(RoommateGroup)
            .where(RoommateGroup.status == GroupStatus.APPROVED, RoommateGroupMember.user_id.in_(member_ids))
            .limit(1)
        )
        if taken is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="A student in this group is already in an approved room."
            )
    group.status = GroupStatus.APPROVED if approve else GroupStatus.REJECTED
    group.decided_at = datetime.now(UTC)
    group.decided_by_id = manager.id
    db.commit()
    db.refresh(group)
    return _roommate_group_out(_Context(db, set(member_ids)), group, ms.load_profiles(db, member_ids))


def group_detail(db: Session, group_id: int) -> RoommateGroupDetailOut:
    group = _get_group(db, group_id)
    detail = _detail(db, [member.user_id for member in group.members])
    return RoommateGroupDetailOut(
        **detail.model_dump(),
        id=group.id,
        run_id=group.run_id,
        room_type=group.room_type,
        status=group.status,
        created_at=group.created_at,
        decided_at=group.decided_at,
        decided_by=group.decided_by.full_name if group.decided_by else None,
    )


# --- Comparing any students (manager tool) -----------------------------------------------------


def _detail(db: Session, user_ids: list[int], first: int | None = None) -> GroupDetailOut:
    profiles = ms.load_profiles(db, user_ids, submitted_only=False)
    ctx = _Context(db, set(user_ids))
    result = ms.score_group(profiles, user_ids)
    pairs = [_pair_out(ctx, pair, profiles, first) for pair in result.pairs]
    return GroupDetailOut(**_group_out(ctx, result).model_dump(), pairs=pairs)


def compare(db: Session, user_ids: list[int]) -> GroupDetailOut:
    """Scores 2-4 chosen students. Unfinished questionnaires are allowed but flagged as incomplete."""
    students = {
        user.id: user for user in db.scalars(select(User).where(User.id.in_(user_ids), User.role == UserRole.STUDENT))
    }
    unknown = [user_id for user_id in user_ids if user_id not in students]
    if unknown:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No student with id {unknown[0]}.")
    started = set(db.scalars(select(SurveyResponse.user_id).where(SurveyResponse.user_id.in_(user_ids))))
    not_started = [students[user_id].full_name for user_id in user_ids if user_id not in started]
    if not_started:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{not_started[0]} has not started the questionnaire yet, so there is nothing to compare.",
        )
    return _detail(db, user_ids)


# --- What a student sees -----------------------------------------------------------------------


def _approved_group(db: Session, user: User) -> RoommateGroup | None:
    return db.scalar(
        select(RoommateGroup)
        .join(RoommateGroupMember)
        .where(RoommateGroupMember.user_id == user.id, RoommateGroup.status == GroupStatus.APPROVED)
        .options(selectinload(RoommateGroup.members))
    )


def matching_state(db: Session, user: User) -> tuple[str, datetime | None]:
    """Short status for the dashboard: (state, approved_at)."""
    if user.room_preference == RoomType.SINGLE:
        return "not_needed", None
    response = db.scalar(select(SurveyResponse).where(SurveyResponse.user_id == user.id))
    if user.room_preference is None or response is None or response.status != ResponseStatus.SUBMITTED:
        return "no_questionnaire", None
    # Only an approved room counts: proposals can still change and stay with the Housing Office.
    group = _approved_group(db, user)
    return ("matched", group.decided_at) if group else ("waiting", None)


def for_student(db: Session, user: User) -> StudentMatchingOut:
    state, _ = matching_state(db, user)
    if state != "matched":
        return StudentMatchingOut(state=state, room_type=user.room_preference)
    group = _approved_group(db, user)

    member_ids = [member.user_id for member in group.members]
    detail = _detail(db, member_ids, first=user.id)
    own_pairs = [pair for pair in detail.pairs if user.id in (pair.student_1.id, pair.student_2.id)]
    return StudentMatchingOut(
        state="matched",
        room_type=group.room_type,
        approved_at=group.decided_at,
        group=GroupOut(**detail.model_dump(exclude={"pairs"})),
        pairs=sorted(own_pairs, key=lambda pair: (-pair.overall_score, pair.student_2.full_name)),
    )
