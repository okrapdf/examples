import {
  Show,
  TabbedShowLayout,
  TextField,
  NumberField,
  DateField,
  useRecordContext,
} from "react-admin";
import { doc } from "okrapdf";
import { ChatTab } from "./ChatTab";
import { LogsTab } from "./LogsTab";

const CoverImage = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <img
      src={doc(record.id as string).pg[1].png({ transform: { w: 400 } })}
      alt={record.file_name as string}
      style={{
        width: 200,
        height: 280,
        objectFit: "cover",
        borderRadius: 8,
        marginBottom: 16,
      }}
    />
  );
};

export const DocumentShow = () => (
  <Show>
    <TabbedShowLayout>
      <TabbedShowLayout.Tab label="Metadata">
        <CoverImage />
        <TextField source="id" />
        <TextField source="file_name" />
        <TextField source="phase" />
        <NumberField source="pages_total" label="Pages" />
        <NumberField source="total_nodes" label="Nodes" />
        <DateField source="added_at" showTime />
      </TabbedShowLayout.Tab>

      <TabbedShowLayout.Tab label="Chat">
        <ChatTab />
      </TabbedShowLayout.Tab>

      <TabbedShowLayout.Tab label="Logs">
        <LogsTab />
      </TabbedShowLayout.Tab>
    </TabbedShowLayout>
  </Show>
);
