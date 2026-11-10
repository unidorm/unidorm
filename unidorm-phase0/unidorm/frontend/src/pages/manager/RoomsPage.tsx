import { useState } from "react";

import PageHeader from "../../components/layout/PageHeader";
import { Callout, Card, Icon, Input, Pill, StatCard } from "../../components/ui";
import { roomGroups } from "../../data/manager";
import type { ScoreBand } from "../../types/domain";
import type { Tone } from "../../types/ui";

const bandMeta: Record<ScoreBand, { label: string; tone: Tone }> = {
  high: { label: "High", tone: "success" },
  medium: { label: "Medium", tone: "warning" },
  low: { label: "Low", tone: "danger" },
};

const columns = ["Room", "Size", "Students", "Room score", "Weakest area", "Red flags"];

export default function RoomsPage() {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();

  const count = (band: ScoreBand) => roomGroups.filter((room) => room.band === band).length;
  const waiting = roomGroups.filter((room) => room.score === null).length;

  const visibleRooms = roomGroups.filter(
    (room) => !term || `${room.roomNumber} ${room.students.join(" ")} ${room.studentsNote ?? ""}`.toLowerCase().includes(term),
  );

  return (
    <>
      <PageHeader
        eyebrow="Housing Office · Jastar City"
        title="Room groups to review"
        description="Room groups, who is assigned to them and how compatible the students are."
        sampleData
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="High" value={count("high")} tone="success" size="lg" />
        <StatCard label="Medium" value={count("medium")} tone="warning" size="lg" />
        <StatCard label="Low" value={count("low")} tone="danger" size="lg" />
        <StatCard label="Waiting for surveys" value={waiting} size="lg" />
      </div>

      <Input
        className="mb-4 mt-8 max-w-md"
        label="Search rooms or students"
        placeholder="Room number or student name"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        startAdornment={<Icon name="search" size={18} />}
      />

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                {columns.map((column) => (
                  <th key={column} scope="col" className="px-5 py-4 font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleRooms.map((room) => (
                <tr key={room.id}>
                  <th scope="row" className="px-5 py-4 font-semibold">
                    <span className="flex items-center gap-2">
                      {room.roomNumber}
                      {room.proposed && <Pill tone="warning">Proposed</Pill>}
                    </span>
                  </th>
                  <td className="px-5 py-4 tabular-nums">{room.capacity}</td>
                  <td className="px-5 py-4">
                    {room.students.length > 0 ? room.students.join(", ") : room.studentsNote}
                  </td>
                  <td className="px-5 py-4">
                    {room.score !== null && room.band ? (
                      <span className="flex items-center gap-2">
                        <span className="font-semibold tabular-nums">{room.score}</span>
                        <Pill tone={bandMeta[room.band].tone}>{bandMeta[room.band].label}</Pill>
                      </span>
                    ) : (
                      <Pill tone="neutral">Not scored</Pill>
                    )}
                  </td>
                  <td className="px-5 py-4">{room.weakestArea ?? "–"}</td>
                  <td className="px-5 py-4">
                    {room.redFlags > 0 ? <Pill tone="danger">{room.redFlags}</Pill> : <span className="text-muted">None</span>}
                  </td>
                </tr>
              ))}
              {visibleRooms.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-8 text-center text-muted">
                    No rooms match “{query.trim()}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Callout className="mt-5">
        Scores and red flags are sample values. Scoring, room review and approving or changing a group arrive in later
        stages.
      </Callout>
    </>
  );
}
