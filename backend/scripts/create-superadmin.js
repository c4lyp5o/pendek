// Bootstrap (or reset) a superadmin account. Public signup is disabled, so
// this is how the first account gets created.
//   bun scripts/create-superadmin.js <username> <password>
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";

const [username, password] = process.argv.slice(2);
if (!username || !password || password.length < 8 || !/^[a-zA-Z0-9_]{1,30}$/.test(username)) {
	console.error("usage: bun scripts/create-superadmin.js <username> <password(>=8 chars)>");
	process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const user = await prisma.user.upsert({
	where: { username },
	update: { password: hash, role: "superadmin" },
	create: { username, password: hash, role: "superadmin" },
});
console.log(`superadmin "${user.username}" ready (id ${user.id})`);
await prisma.$disconnect();
