export default function getLegibleCurrentDate() {
    const now = new Date();
    return `${
        now.getDate().toString().padStart(2, "0")
    }/${
        (now.getMonth() + 1).toString().padStart(2, "0")
    }/${now.getFullYear()}`;
}