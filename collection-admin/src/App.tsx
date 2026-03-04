import { Admin, Resource, defaultTheme } from "react-admin";
import { dataProvider } from "./dataProvider";
import { DocumentList } from "./documents/DocumentList";
import { DocumentShow } from "./documents/DocumentShow";

const theme = {
  ...defaultTheme,
  palette: {
    ...defaultTheme.palette,
    mode: "light" as const,
    primary: { main: "#2563eb" },
    secondary: { main: "#7c3aed" },
    text: {
      primary: "#111827",
      secondary: "#4b5563",
      disabled: "#9ca3af",
    },
    background: {
      default: "#f9fafb",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
};

export const App = () => (
  <Admin dataProvider={dataProvider} theme={theme} defaultTheme="light">
    <Resource
      name="documents"
      list={DocumentList}
      show={DocumentShow}
      recordRepresentation="file_name"
    />
  </Admin>
);
