import { useAuthPoller } from "../../hooks/useAuthPoller";

export const AuthPollerWrapper = () => {
  useAuthPoller();
  return null; // invisible component that just runs the hook
};