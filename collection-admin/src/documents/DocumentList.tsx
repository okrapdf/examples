import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  TextInput,
  FunctionField,
  useRecordContext,
} from "react-admin";
import { doc } from "okrapdf";

const ThumbnailField = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <img
      src={doc(record.id as string).pg[1].png({ transform: { w: 80 } })}
      alt={record.file_name as string}
      style={{ width: 40, height: 56, objectFit: "cover", borderRadius: 4 }}
      loading="lazy"
    />
  );
};

const filters = [<TextInput key="q" source="q" label="Search" alwaysOn />];

export const DocumentList = () => (
  <List filters={filters} sort={{ field: "file_name", order: "ASC" }} perPage={100}>
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <ThumbnailField />
      <TextField source="file_name" />
      <FunctionField
        label="Phase"
        render={(record: { phase: string }) => (
          <span
            style={{
              color: record.phase === "complete" ? "#22c55e" : "#ef4444",
              fontWeight: 600,
            }}
          >
            {record.phase}
          </span>
        )}
      />
      <NumberField source="pages_total" label="Pages" />
      <NumberField source="total_nodes" label="Nodes" />
      <DateField source="added_at" showTime />
    </Datagrid>
  </List>
);
