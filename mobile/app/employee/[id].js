import { useLocalSearchParams } from "expo-router";
import EmployeeLoansScreen from "../../src/screens/EmployeeLoansScreen";

export default function EmployeeLoansRoute() {
  const { id, name } = useLocalSearchParams();
  return <EmployeeLoansScreen employeeId={id} employeeName={name} />;
}
