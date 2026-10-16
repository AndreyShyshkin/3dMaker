const initialServices = [
    { id: "srv-01", name: "FDM друк біополімером PLA", type: "FDM друк", viewsDay1: 140, viewsDay2: 185, duration: 12, price: 250 },
    { id: "srv-02", name: "FDM друк ударостійким PETG", type: "FDM друк", viewsDay1: 210, viewsDay2: 260, duration: 24, price: 380 },
    { id: "srv-03", name: "SLA друк фотополімерною смолою", type: "SLA друк", viewsDay1: 175, viewsDay2: 310, duration: 12, price: 590 },
    { id: "srv-04", name: "SLS лазерне спікання PA12", type: "SLS друк", viewsDay1: 95, viewsDay2: 130, duration: 48, price: 1450 },
    { id: "srv-05", name: "Оптичне 3D-сканування", type: "3D-сканування", viewsDay1: 120, viewsDay2: 160, duration: 24, price: 850 },
    { id: "srv-06", name: "CAD-моделювання виробів", type: "Моделювання", viewsDay1: 180, viewsDay2: 240, duration: 36, price: 1100 },
    { id: "srv-07", name: "Ацетонове згладжування парів", type: "Постобробка", viewsDay1: 85, viewsDay2: 115, duration: 12, price: 200 },
    { id: "srv-08", name: "Порошкове фарбування деталей", type: "Постобробка", viewsDay1: 130, viewsDay2: 170, duration: 36, price: 450 },
    { id: "srv-09", name: "Пряме виробництво за URL", type: "Онлайн-сервіс", viewsDay1: 290, viewsDay2: 420, duration: 24, price: 320 },
    { id: "srv-10", name: "Вакуумне лиття в силікон", type: "Лиття", viewsDay1: 70, viewsDay2: 95, duration: 72, price: 2800 }
];

function sortByDurationAndAvgViews(list) {
    const sorted = [...list].sort((a, b) => a.duration - b.duration);
    const groups = {};
    for (const item of sorted) {
        if (!groups[item.duration]) {
            groups[item.duration] = [];
        }
        groups[item.duration].push(item);
    }
    const averages = Object.keys(groups).map(dur => {
        const items = groups[dur];
        const totalViews = items.reduce((sum, s) => sum + s.viewsDay1 + s.viewsDay2, 0);
        return {
            duration: Number(dur),
            count: items.length,
            services: items.map(s => s.name),
            avgReadership: Number((totalViews / (items.length * 2)).toFixed(2))
        };
    });
    return { sorted, averages };
}

function getMaxViewsDay2(list) {
    const leader = list.reduce((max, s) => (s.viewsDay2 > max.viewsDay2 ? s : max), list[0]);
    return {
        name: leader.name,
        type: leader.type,
        viewsDay2: leader.viewsDay2
    };
}

function addServiceRecord(list, newRecord) {
    const copy = [...list];
    const isComplete = Boolean(
        newRecord &&
        newRecord.id &&
        newRecord.name &&
        newRecord.type &&
        newRecord.viewsDay1 !== undefined &&
        newRecord.viewsDay2 !== undefined &&
        newRecord.duration !== undefined &&
        newRecord.price !== undefined
    );

    if (!isComplete) {
        copy.push(newRecord);
        return {
            list: copy,
            insertedIndex: copy.length - 1,
            action: "Неповні дані — додано в кінець списку"
        };
    }

    copy.sort((a, b) => a.price - b.price);
    const targetIndex = copy.findIndex(item => item.price >= newRecord.price);
    const insertAt = targetIndex === -1 ? copy.length : targetIndex;
    copy.splice(insertAt, 0, newRecord);

    return {
        list: copy,
        insertedIndex: insertAt,
        action: "Повні дані — вставлено за зростанням вартості"
    };
}

function calculateSimultaneousDuration(selectedServices) {
    const count = selectedServices.length;
    let multiplier = 1.0;

    if (count > 1 && count <= 3) {
        multiplier = 1.1;
    } else if (count > 3) {
        multiplier = 2.0;
    }

    const calculated = selectedServices.map(s => ({
        name: s.name,
        baseDuration: s.duration,
        adjustedDuration: Number((s.duration * multiplier).toFixed(1))
    }));

    const totalHours = Number(calculated.reduce((sum, s) => sum + s.adjustedDuration, 0).toFixed(1));

    return {
        count,
        multiplier,
        totalHours,
        services: calculated
    };
}

class UserInquiry {
    constructor(lastName, firstName, age, email, purpose, date, time) {
        this.lastName = lastName;
        this.firstName = firstName;
        this.age = age;
        this.email = email;
        this.purpose = purpose;
        this.date = date;
        this.time = time;
    }

    get fullName() {
        return `${this.lastName} ${this.firstName}`;
    }

    getMonth() {
        return new Date(this.date).getMonth() + 1;
    }

    get category() {
        if (this.age < 25 && this.purpose === "побажання") {
            return "активна молодь";
        }
        if (this.age > 60 && this.purpose === "претензія") {
            return "похилий претензійний";
        }
        if (this.age > 25 && this.age < 60 && this.purpose !== "претензія") {
            return "середній без претензій";
        }
        return "інші";
    }
}

class CRMSystem {
    constructor(users) {
        this.users = users;
    }

    filterByMonthAndTime(month, time) {
        return this.users.filter(u => u.getMonth() === month && u.time === time);
    }

    getYoungestUser() {
        return this.users.reduce((youngest, u) => (u.age < youngest.age ? u : youngest), this.users[0]);
    }

    getCategoryCounts() {
        const counts = {
            "активна молодь": 0,
            "похилий претензійний": 0,
            "середній без претензій": 0,
            "інші": 0
        };
        for (const user of this.users) {
            counts[user.category] = (counts[user.category] || 0) + 1;
        }
        return counts;
    }

    sortByEmailWithPurpose() {
        return [...this.users]
            .sort((a, b) => a.email.localeCompare(b.email))
            .map(u => ({
                email: u.email,
                purpose: u.purpose,
                fullName: u.fullName
            }));
    }
}

const initialUsers = [
    new UserInquiry("Шевченко", "Іван", 22, "ivan.shevchenko@gmail.com", "побажання", "2026-10-14", "14:30"),
    new UserInquiry("Коваль", "Оксана", 65, "o.koval@outlook.com", "претензія", "2026-10-12", "11:15"),
    new UserInquiry("Бондаренко", "Максим", 34, "m.bondarenko@techcorp.ua", "консультація", "2026-10-14", "14:30"),
    new UserInquiry("Мельник", "Софія", 20, "sofia.melnyk@univ.kiev.ua", "побажання", "2026-09-28", "16:45"),
    new UserInquiry("Ткаченко", "Григорій", 71, "hryhoriy.t@meta.ua", "претензія", "2026-10-02", "10:00"),
    new UserInquiry("Кравченко", "Дмитро", 42, "dmytro.kravchenko@gmail.com", "відгук", "2026-10-14", "15:20"),
    new UserInquiry("Шевченко", "Тарас", 29, "taras.sheva@makerhub.org", "побажання", "2026-09-25", "13:00"),
    new UserInquiry("Мороз", "Анастасія", 19, "anastasia.moroz@student.kpi.ua", "претензія", "2026-10-03", "17:10"),
    new UserInquiry("Павленко", "Віктор", 62, "v.pavlenko@engineering.com", "консультація", "2026-10-15", "12:00"),
    new UserInquiry("Лисенко", "Артем", 25, "artem.lysenko@inbox.ua", "побажання", "2026-10-09", "14:30")
];

function runAllLabTasks() {
    console.log("=== ЧАСТИНА 1: ФУНКЦІОНАЛЬНИЙ JS (СЕРВІСИ) ===");
    const sortResult = sortByDurationAndAvgViews(initialServices);
    console.log("1.1. Впорядкування за тривалістю та середні перегляди:", sortResult.averages);

    const leaderResult = getMaxViewsDay2(initialServices);
    console.log("1.2. Лідер за переглядами за добу 2:", leaderResult.name, "| Тип:", leaderResult.type, "| Переглядів:", leaderResult.viewsDay2);

    const testIncomplete = { id: "srv-11", name: "Новий сервіс" };
    const addIncompleteResult = addServiceRecord(initialServices, testIncomplete);
    console.log("1.3a. Додавання неповного запису:", addIncompleteResult.action, "| Позиція:", addIncompleteResult.insertedIndex);

    const testComplete = { id: "srv-12", name: "3D-друк смолою Tough", type: "SLA друк", viewsDay1: 90, viewsDay2: 140, duration: 18, price: 400 };
    const addCompleteResult = addServiceRecord(initialServices, testComplete);
    console.log("1.3b. Додавання повного запису (ціна 400):", addCompleteResult.action, "| Позиція:", addCompleteResult.insertedIndex);

    const duration1 = calculateSimultaneousDuration([initialServices[0]]);
    const duration2 = calculateSimultaneousDuration([initialServices[0], initialServices[1]]);
    const duration4 = calculateSimultaneousDuration([initialServices[0], initialServices[1], initialServices[2], initialServices[3]]);
    console.log("1.4. Тривалість одночасного надання:");
    console.log("  1 сервіс (коеф. " + duration1.multiplier + "):", duration1.totalHours, "год");
    console.log("  2 сервіси (коеф. " + duration2.multiplier + "):", duration2.totalHours, "год");
    console.log("  4 сервіси (коеф. " + duration4.multiplier + "):", duration4.totalHours, "год");

    console.log("\n=== ЧАСТИНА 2: ОБ'ЄКТНО-ОРІЄНТОВАНИЙ JS (CRM КОРИСТУВАЧІВ) ===");
    const crm = new CRMSystem(initialUsers);

    const filteredUsers = crm.filterByMonthAndTime(10, "14:30");
    console.log("2.1. Звернення за жовтень о 14:30:", filteredUsers.map(u => `${u.fullName} (${u.email})`));

    const youngest = crm.getYoungestUser();
    console.log("2.2. Наймолодший клієнт: вік " + youngest.age + ", email: " + youngest.email + ", дата: " + youngest.date);

    const categories = crm.getCategoryCounts();
    console.log("2.3. Кількість користувачів за класами:", categories);

    const sortedUsers = crm.sortByEmailWithPurpose();
    console.log("2.4. Сортування за алфавітом email із метою:", sortedUsers);

    if (typeof document !== "undefined") {
        renderPageResults({
            services: initialServices,
            sortResult,
            leaderResult,
            addIncompleteResult,
            addCompleteResult,
            durations: { duration1, duration2, duration4 },
            users: initialUsers,
            filteredUsers,
            youngest,
            categories,
            sortedUsers
        });
    }
}

function renderPageResults(data) {
    const t1El = document.getElementById("task1-output");
    const t2El = document.getElementById("task2-output");

    if (t1El) {
        t1El.innerHTML = `
            <div class="result-card">
                <h3>1.1. Впорядкування за тривалістю та середня кількість читачів:</h3>
                <table class="lab-table">
                    <thead>
                        <tr>
                            <th>Тривалість</th>
                            <th>Кількість сервісів</th>
                            <th>Сервіси</th>
                            <th>Середня аудиторія</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.sortResult.averages.map(a => `
                            <tr>
                                <td><strong>${a.duration} год</strong></td>
                                <td>${a.count}</td>
                                <td>${a.services.join(", ")}</td>
                                <td><strong>${a.avgReadership}</strong></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <div class="result-card">
                <h3>1.2. Лідер за кількістю читачів за добу 2:</h3>
                <p>
                    Назва: <strong>${data.leaderResult.name}</strong><br>
                    Тип сервісу: <span class="badge">${data.leaderResult.type}</span><br>
                    Читачів за добу 2: <strong>${data.leaderResult.viewsDay2}</strong>
                </p>
            </div>

            <div class="result-card">
                <h3>1.3. Додавання нового запису:</h3>
                <p>
                    <strong>Неповні дані:</strong> ${data.addIncompleteResult.action} (позиція індексу: ${data.addIncompleteResult.insertedIndex})<br>
                    <strong>Повні дані (ціна 400 грн):</strong> ${data.addCompleteResult.action} (позиція індексу: ${data.addCompleteResult.insertedIndex})
                </p>
            </div>

            <div class="result-card">
                <h3>1.4. Одночасне надання декількох сервісів:</h3>
                <ul>
                    <li>1 сервіс (коефіцієнт ${data.durations.duration1.multiplier}x): <strong>${data.durations.duration1.totalHours} год</strong></li>
                    <li>2 сервіси (коефіцієнт ${data.durations.duration2.multiplier}x): <strong>${data.durations.duration2.totalHours} год</strong></li>
                    <li>4 сервіси (коефіцієнт ${data.durations.duration4.multiplier}x): <strong>${data.durations.duration4.totalHours} год</strong></li>
                </ul>
            </div>
        `;
    }

    if (t2El) {
        t2El.innerHTML = `
            <div class="result-card">
                <h3>2.1. Користувачі, що звернулися у жовтні (місяць 10) о 14:30:</h3>
                <ul>
                    ${data.filteredUsers.map(u => `
                        <li><strong>${u.fullName}</strong> — Email: ${u.email}, Мета: ${u.purpose}, Дата: ${u.date}</li>
                    `).join("")}
                </ul>
            </div>

            <div class="result-card">
                <h3>2.2. Наймолодший користувач:</h3>
                <p>
                    Ім'я: <strong>${data.youngest.fullName}</strong><br>
                    Мінімальний вік: <strong>${data.youngest.age} років</strong><br>
                    Email: <strong>${data.youngest.email}</strong><br>
                    Дата звернення: <strong>${data.youngest.date}</strong>
                </p>
            </div>

            <div class="result-card">
                <h3>2.3. Розподіл клієнтів на класи:</h3>
                <table class="lab-table">
                    <thead>
                        <tr>
                            <th>Клас</th>
                            <th>Критерій класифікації</th>
                            <th>Кількість</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>«активна молодь»</td><td>вік &lt; 25 та мета = «побажання»</td><td><strong>${data.categories["активна молодь"]}</strong></td></tr>
                        <tr><td>«похилий претензійний»</td><td>вік &gt; 60 та мета = «претензія»</td><td><strong>${data.categories["похилий претензійний"]}</strong></td></tr>
                        <tr><td>«середній без претензій»</td><td>25 &lt; вік &lt; 60 та мета &ne; «претензія»</td><td><strong>${data.categories["середній без претензій"]}</strong></td></tr>
                        <tr><td>«інші»</td><td>всі інші випадки</td><td><strong>${data.categories["інші"]}</strong></td></tr>
                    </tbody>
                </table>
            </div>

            <div class="result-card">
                <h3>2.4. Сортування за алфавітом Email із метою зворотнього зв'язку:</h3>
                <table class="lab-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Email адреса</th>
                            <th>Клієнт</th>
                            <th>Мета звернення</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.sortedUsers.map((u, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td><code>${u.email}</code></td>
                                <td>${u.fullName}</td>
                                <td><span class="badge">${u.purpose}</span></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }
}

if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", runAllLabTasks);
} else {
    runAllLabTasks();
}
