// VAPID kalit juftini yaratadi. Bir marta ishlatiladi, natija .env.local ga.
import webpush from "web-push";

const { publicKey, privateKey } = webpush.generateVAPIDKeys();

console.log(`
Quyidagilarni .env.local ga ko'chiring:

VAPID_PUBLIC_KEY=${publicKey}
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKey}
VAPID_PRIVATE_KEY=${privateKey}
VAPID_SUBJECT=mailto:siz@example.com

Ochiq kalit ikki marta yozilgani ataylab: biri serverda imzolash uchun,
ikkinchisi brauzerga yetib borishi kerak (NEXT_PUBLIC_ prefiksi shuni bildiradi).
Yopiq kalit hech qachon brauzerga chiqmaydi.
`);
