import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Feedback = ({ entries }) => {
  const isLoading = !entries || entries.length === 0;
  const latestEntry = !isLoading ? entries[entries.length - 1] : null;
  const subMessage = !isLoading
    ? entries.length > 1
      ? entries[entries.length - 2]
      : null
    : null;

  return (
    <Card style={{ borderRadius: "20px" }}>
      <CardHeader>
        <CardTitle>
          <h3>Feedback</h3>
        </CardTitle>
      </CardHeader>
      <div className="border-b border-gray-300 my-2" />
      <CardContent>
        <div className="pad">
          {isLoading ? (
            <h2>Loading</h2>
          ) : (
            <h2 style={{ scale: 1.5 }}>{latestEntry.message}</h2>
          )}
        </div>
        <div className="pad">
          {subMessage === null ? (
            <></>
          ) : (
            <h2 style={{ scale: 1, color: "rgb(153, 153, 153)" }}>
              {subMessage.message}
            </h2>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Feedback;
