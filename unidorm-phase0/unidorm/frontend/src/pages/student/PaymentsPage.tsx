import LaterNotice from "../../components/layout/LaterNotice";
import PageHeader from "../../components/layout/PageHeader";
import { Button, Card, Pill } from "../../components/ui";

const rows = [
  { id: "fee", label: "Accommodation fee", value: "Not available" },
  { id: "history", label: "Payment history", value: "No payments yet" },
];

export default function PaymentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Payments"
        title="Payments"
        description="Accommodation fees and payment history will be shown here."
      />
      <LaterNotice>Payments are not part of this version. Nothing here can be paid or changed yet.</LaterNotice>

      <Card
        variant="sunken"
        className="border-dashed"
        title="Payment overview"
        description="Preview of the layout."
        actions={
          <Pill caps tone="neutral">
            Later
          </Pill>
        }
      >
        <dl className="divide-y divide-border">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-4 py-3 first:pt-0">
              <dt className="text-sm text-muted">{row.label}</dt>
              <dd className="text-sm font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
        <Button className="mt-4" variant="outline" disabled>
          Make a payment
        </Button>
      </Card>
    </>
  );
}
