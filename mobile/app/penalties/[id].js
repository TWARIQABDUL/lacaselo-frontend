import { useLocalSearchParams } from "expo-router";
import EmployeePenaltiesScreen from "../../src/screens/EmployeePenaltiesScreen";

export default function EmployeePenaltiesRoute() {
  const { id, name } = useLocalSearchParams();
  return <EmployeePenaltiesScreen employeeId={id} employeeName={name} />;
}
