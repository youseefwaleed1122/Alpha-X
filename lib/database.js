import { resolve, dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

class Database {
    constructor(filepath) {
        this.file = resolve(__dirname, filepath);
        this.data = { users: {}, chats: {}, settings: {} };
        this._load();
    }

    _load() {
        try {
            if (fs.existsSync(this.file)) {
                this.data = JSON.parse(fs.readFileSync(this.file, 'utf-8'));
            } else {
                this.save(); 
            }
        } catch (e) {
            console.error("❌ Error loading database:", e);
            this.data = { users: {}, chats: {}, settings: {} };
        }
    }

    // نستخدم اسم save بدلاً من _save ونجعلها أكثر ذكاءً
    save() {
        if (this._saveTimeout) return; // منع الحفظ المتكرر في نفس اللحظة

        this._saveTimeout = setTimeout(() => {
            try {
                const dir = dirname(this.file);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
                this._saveTimeout = null;
            } catch (e) {
                console.error("❌ Error saving database:", e);
                this._saveTimeout = null;
            }
        }, 2000); // تأخير الحفظ لمدة ثانيتين لتجميع كل التغييرات وحفظها مرة واحدة
    }
}

const db = new Database('../src/json/db.json');
export const loadDatabase = async () => db;
export default db;
