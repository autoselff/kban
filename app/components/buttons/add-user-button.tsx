import { addUser } from "../../../lib/users";

export default function AddUserButton() {
  return (
    <form action={addUser}>
      <button type="submit">Add User</button>
    </form>
  );
}
