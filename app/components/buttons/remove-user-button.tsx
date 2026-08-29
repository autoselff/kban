import { removeUser } from "@/lib/users";

export default function RemoveUserButton() {
  return (
    <form action={removeUser}>
      <button type="submit">Remove User</button>
    </form>
  );
}
