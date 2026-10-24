const initialServicesData = [
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
        let totalViews = 0;
        for (const s of items) {
            totalViews += s.viewsDay1 + s.viewsDay2;
        }
        const rawAvg = totalViews / (items.length * 2);
        return {
            duration: Number(dur),
            count: items.length,
            services: items.map(s => s.name),
            avgReadership: Math.round(rawAvg * 100) / 100
        };
    });
    return { sorted, averages };
}

function getMaxViewsDay2(list) {
    const maxViews = Math.max(...list.map(s => s.viewsDay2));
    const leader = list.find(s => s.viewsDay2 === maxViews) || list[0];
    return {
        leader,
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
    let targetIndex = -1;
    let idx = 0;
    while (idx < copy.length) {
        if (copy[idx].price >= newRecord.price) {
            targetIndex = idx;
            break;
        }
        idx++;
    }
    const insertAt = targetIndex === -1 ? copy.length : targetIndex;
    copy.splice(insertAt, 0, newRecord);

    return {
        list: copy,
        insertedIndex: insertAt,
        action: "Повні дані — вставлено за зростанням вартості"
    };
}

const formatPrice = function(val) {
    if (val === null || val === undefined) {
        return "—";
    }
    return String(val) + " грн";
};

function computeStepTotal(baseValue, count) {
    let total = 0;
    let step = 0;
    do {
        total += baseValue;
        step++;
    } while (step < count);
    return total;
}

function inspectDataTypes() {
    const testNum = 42;
    const testStr = "3D";
    const testBool = true;
    const testObj = { project: "3dMaker" };
    const testArr = [1, 2, 3];
    const testFn = function() {};
    let testScale = 1;
    testScale *= 2;
    return {
        primitiveNumber: typeof testNum,
        primitiveString: typeof testStr,
        primitiveBoolean: typeof testBool,
        objectRecord: typeof testObj,
        objectArray: typeof testArr,
        objectFunction: typeof testFn,
        scaledSample: testScale
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

    getYear() {
        return new Date(this.date).getFullYear();
    }

    getDay() {
        return new Date(this.date).getDate();
    }

    getPriority() {
        switch (this.purpose) {
            case "претензія":
                return "високий";
            case "консультація":
                return "середній";
            case "побажання":
                return "низький";
            default:
                return "стандартний";
        }
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
        const minAge = Math.min(...this.users.map(u => u.age));
        return this.users.find(u => u.age === minAge) || this.users[0];
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
            .filter(u => u.email.toLowerCase().includes("@"))
            .sort((a, b) => a.email.localeCompare(b.email))
            .map(u => ({
                email: u.email,
                purpose: u.purpose,
                fullName: u.fullName
            }));
    }
}

const initialUsersRaw = [
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

let currentServices = initialServicesData.map(s => ({ ...s }));
let selectedServiceIds = new Set();
let showAveragesColumn = false;
let durationMultiplier = 1.0;
let leaderServiceId = null;
let addedServiceId = null;

let currentUsers = [...initialUsersRaw];
let showClassesColumn = false;
let youngestUserEmail = null;

function renderServicesTable() {
    const tbody = document.getElementById("services-tbody");
    const thAvg = document.getElementById("th-avg-readership");
    if (!tbody) return;

    if (thAvg) {
        thAvg.style.display = showAveragesColumn ? "table-cell" : "none";
    }

    const { averages } = sortByDurationAndAvgViews(currentServices);
    const avgMap = {};
    for (const a of averages) {
        avgMap[a.duration] = a.avgReadership;
    }

    tbody.innerHTML = currentServices.map(s => {
        const isChecked = selectedServiceIds.has(s.id);
        const isLeader = s.id === leaderServiceId;
        const isAdded = s.id === addedServiceId;
        const displayDuration = isChecked && durationMultiplier > 1.0
            ? `${(s.duration * durationMultiplier).toFixed(1)} год`
            : `${s.duration} год`;

        let rowClass = "";
        if (isLeader) rowClass = "row-leader";
        if (isAdded) rowClass = "row-added";

        return `
            <tr class="${rowClass}">
                <td align="center">
                    <input type="checkbox" data-service-id="${s.id}" ${isChecked ? "checked" : ""}>
                </td>
                <td><code>${s.id}</code></td>
                <td><strong>${s.name}</strong></td>
                <td><span class="badge">${s.type}</span></td>
                <td>${s.viewsDay1}</td>
                <td><strong>${s.viewsDay2}</strong></td>
                <td><span class="duration-pill ${isChecked && durationMultiplier > 1.0 ? "pill-adjusted" : ""}">${displayDuration}</span></td>
                <td>${formatPrice(s.price)}</td>
                ${showAveragesColumn ? `<td><strong>${avgMap[s.duration] || "—"}</strong></td>` : ""}
            </tr>
        `;
    }).join("");

    const checkboxes = tbody.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener("change", e => {
            const id = e.target.getAttribute("data-service-id");
            if (e.target.checked) {
                selectedServiceIds.add(id);
            } else {
                selectedServiceIds.delete(id);
            }
            updateSimultaneousDurationUI();
        });
    });
}

function updateSimultaneousDurationUI() {
    const selected = currentServices.filter(s => selectedServiceIds.has(s.id));
    const result = calculateSimultaneousDuration(selected);
    durationMultiplier = result.multiplier;

    const statusEl = document.getElementById("services-status");
    if (selected.length > 0) {
        statusEl.innerHTML = `<strong>1.4. Одночасне надання:</strong> обрано ${result.count} сервісів (коефіцієнт ${result.multiplier}x). Загальна тривалість: <strong>${result.totalHours} год</strong>.`;
        statusEl.style.display = "block";
    } else {
        durationMultiplier = 1.0;
        statusEl.style.display = "none";
    }

    renderServicesTable();
}

function handleSortByDuration() {
    const result = sortByDurationAndAvgViews(currentServices);
    currentServices = result.sorted;
    showAveragesColumn = true;
    leaderServiceId = null;
    addedServiceId = null;
    renderServicesTable();

    const statusEl = document.getElementById("services-status");
    statusEl.innerHTML = `
        <strong>1.1. Таблицю впорядковано за тривалістю надання:</strong> додано колонку середньої кількості читачів для однакових термінів.
        (${result.averages.map(a => `${a.duration} год: <strong>${a.avgReadership}</strong>`).join(" | ")})
    `;
    statusEl.style.display = "block";
}

function handleFindLeaderDay2() {
    const result = getMaxViewsDay2(currentServices);
    leaderServiceId = result.leader.id;
    addedServiceId = null;
    renderServicesTable();

    const statusEl = document.getElementById("services-status");
    statusEl.innerHTML = `
        <strong>1.2. Лідер за кількістю читачів за добу 2:</strong> підсвічено у таблиці рядок <strong>«${result.name}»</strong>.
        Тип сервісу: <span class="badge">${result.type}</span> | Читачів Д2: <strong>${result.viewsDay2}</strong>.
    `;
    statusEl.style.display = "block";
}

function handleAddIncompleteService() {
    const newRecord = {
        id: `srv-${currentServices.length + 1}`,
        name: "3D-друк експериментальним полімером"
    };
    const result = addServiceRecord(currentServices, newRecord);
    currentServices = result.list;
    addedServiceId = newRecord.id;
    leaderServiceId = null;
    renderServicesTable();

    const statusEl = document.getElementById("services-status");
    statusEl.innerHTML = `
        <strong>1.3. Додано неповний запис:</strong> додано в кінець таблиці рядок <code>${newRecord.id}</code> (позиція ${result.insertedIndex + 1}).
    `;
    statusEl.style.display = "block";
}

function handleAddCompleteService() {
    const newRecord = {
        id: `srv-${currentServices.length + 1}`,
        name: "3D-друк фотополімером Tough Resin",
        type: "SLA друк",
        viewsDay1: 95,
        viewsDay2: 140,
        duration: 18,
        price: 400
    };
    const result = addServiceRecord(currentServices, newRecord);
    currentServices = result.list;
    addedServiceId = newRecord.id;
    leaderServiceId = null;
    renderServicesTable();

    const statusEl = document.getElementById("services-status");
    statusEl.innerHTML = `
        <strong>1.3. Додано повний запис:</strong> вставлено у відсортовану за вартістю таблицю рядок <code>${newRecord.id}</code> (ціна: 400 грн, позиція ${result.insertedIndex + 1}).
    `;
    statusEl.style.display = "block";
}

function handleResetServices() {
    currentServices = initialServicesData.map(s => ({ ...s }));
    selectedServiceIds.clear();
    showAveragesColumn = false;
    durationMultiplier = 1.0;
    leaderServiceId = null;
    addedServiceId = null;
    renderServicesTable();

    const statusEl = document.getElementById("services-status");
    statusEl.style.display = "none";
}

function renderUsersTable() {
    const tbody = document.getElementById("users-tbody");
    const thClass = document.getElementById("th-user-class");
    if (!tbody) return;

    if (thClass) {
        thClass.style.display = showClassesColumn ? "table-cell" : "none";
    }

    tbody.innerHTML = currentUsers.map(u => {
        const isYoungest = u.email === youngestUserEmail;
        return `
            <tr class="${isYoungest ? "row-youngest" : ""}">
                <td><strong>${u.fullName}</strong></td>
                <td>${u.age}</td>
                <td><code>${u.email}</code></td>
                <td><span class="badge">${u.purpose}</span></td>
                <td>${u.date}</td>
                <td>${u.time}</td>
                ${showClassesColumn ? `<td><span class="class-pill class-${u.category.replace(/\s+/g, '-')}">${u.category}</span></td>` : ""}
            </tr>
        `;
    }).join("");
}

function handleFilterUsers() {
    const crm = new CRMSystem(initialUsersRaw);
    currentUsers = crm.filterByMonthAndTime(10, "14:30");
    youngestUserEmail = null;
    renderUsersTable();

    const statusEl = document.getElementById("users-status");
    statusEl.innerHTML = `
        <strong>2.1. Фільтрація (жовтень, 14:30):</strong> у таблиці залишено ${currentUsers.length} користувачів, які звернулися у цей момент.
    `;
    statusEl.style.display = "block";
}

function handleFindYoungestUser() {
    const crm = new CRMSystem(initialUsersRaw);
    const youngest = crm.getYoungestUser();
    currentUsers = [...initialUsersRaw];
    youngestUserEmail = youngest.email;
    renderUsersTable();

    const statusEl = document.getElementById("users-status");
    statusEl.innerHTML = `
        <strong>2.2. Наймолодший клієнт:</strong> підсвічено у таблиці рядок <strong>${youngest.fullName}</strong>.
        Мінімальний вік: <strong>${youngest.age} років</strong> | Email: <code>${youngest.email}</code> | Дата звернення: <strong>${youngest.date}</strong>.
    `;
    statusEl.style.display = "block";
}

function handleSegmentUsers() {
    const crm = new CRMSystem(initialUsersRaw);
    currentUsers = [...initialUsersRaw];
    showClassesColumn = true;
    youngestUserEmail = null;
    renderUsersTable();

    const counts = crm.getCategoryCounts();
    const statusEl = document.getElementById("users-status");
    statusEl.innerHTML = `
        <strong>2.3. Додано класифікацію користувачів за 4 класами:</strong>
        «активна молодь»: <strong>${counts["активна молодь"]}</strong> |
        «похилий претензійний»: <strong>${counts["похилий претензійний"]}</strong> |
        «середній без претензій»: <strong>${counts["середній без претензій"]}</strong> |
        «інші»: <strong>${counts["інші"]}</strong>.
    `;
    statusEl.style.display = "block";
}

function handleSortUsersByEmail() {
    const crm = new CRMSystem(initialUsersRaw);
    currentUsers = crm.sortByEmailWithPurpose().map(item => {
        return initialUsersRaw.find(u => u.email === item.email);
    });
    youngestUserEmail = null;
    renderUsersTable();

    const statusEl = document.getElementById("users-status");
    statusEl.innerHTML = `
        <strong>2.4. Таблицю впорядковано за алфавітом Email:</strong> кожна адреса співставлена з відповідною метою звернення.
    `;
    statusEl.style.display = "block";
}

function handleResetUsers() {
    currentUsers = [...initialUsersRaw];
    showClassesColumn = false;
    youngestUserEmail = null;
    renderUsersTable();

    const statusEl = document.getElementById("users-status");
    statusEl.style.display = "none";
}

function runConsoleAudit() {
    console.log("=== ДЕМОНСТРАЦІЯ ТИПІВ ДАНИХ ТА typeof ===");
    console.log(inspectDataTypes());

    console.log("\n=== ДЕМОНСТРАЦІЯ Date / Math / String МЕТОДІВ ===");
    const sampleUser = initialUsersRaw[0];
    console.log("Date методи (рік, місяць, день):", sampleUser.getYear(), sampleUser.getMonth(), sampleUser.getDay());
    console.log("Math методи (max, min, round):", Math.max(140, 420), Math.min(19, 71), Math.round(168.333));
    console.log("String методи (lowercase, includes, localeCompare):", sampleUser.email.toLowerCase(), sampleUser.email.includes("@"), "alpha".localeCompare("beta"));
    console.log("Switch оператор (пріоритет звернення):", sampleUser.getPriority());
    console.log("do...while цикл (сума кроків):", computeStepTotal(10, 3));

    console.log("\n=== ЧАСТИНА 1: ФУНКЦІОНАЛЬНИЙ JS (СЕРВІСИ) ===");
    const sortRes = sortByDurationAndAvgViews(initialServicesData);
    console.log("1.1. Впорядковані назви за тривалістю:", sortRes.sorted.map(s => `${s.name} (${s.duration} год)`));
    console.log("1.1. Середні перегляди для однакової тривалості:", sortRes.averages);

    const leaderRes = getMaxViewsDay2(initialServicesData);
    console.log("1.2. Лідер за переглядами за добу 2:", leaderRes.name, "| Тип:", leaderRes.type, "| Переглядів:", leaderRes.viewsDay2);

    const addInc = addServiceRecord(initialServicesData, { id: "srv-11", name: "Неповний сервіс" });
    console.log("1.3a. Додавання неповного запису:", addInc.action, "| Індекс:", addInc.insertedIndex);

    const addComp = addServiceRecord(initialServicesData, { id: "srv-12", name: "Повний сервіс", type: "SLA друк", viewsDay1: 90, viewsDay2: 140, duration: 18, price: 400 });
    console.log("1.3b. Додавання повного запису (ціна 400):", addComp.action, "| Індекс:", addComp.insertedIndex);

    const d1 = calculateSimultaneousDuration([initialServicesData[0]]);
    const d2 = calculateSimultaneousDuration([initialServicesData[0], initialServicesData[1]]);
    const d4 = calculateSimultaneousDuration([initialServicesData[0], initialServicesData[1], initialServicesData[2], initialServicesData[3]]);
    console.log("1.4. Одночасна тривалість: 1 сервіс =", d1.totalHours, "год | 2 сервіси =", d2.totalHours, "год | 4 сервіси =", d4.totalHours, "год");

    console.log("\n=== ЧАСТИНА 2: ОБ'ЄКТНО-ОРІЄНТОВАНИЙ JS (CRM КОРИСТУВАЧІВ) ===");
    const crm = new CRMSystem(initialUsersRaw);
    console.log("2.1. Звернення за жовтень о 14:30:", crm.filterByMonthAndTime(10, "14:30").map(u => u.fullName));
    const young = crm.getYoungestUser();
    console.log("2.2. Наймолодший клієнт: вік", young.age, "| Email:", young.email, "| Дата:", young.date);
    console.log("2.3. Кількість користувачів за 4 класами:", crm.getCategoryCounts());
    console.log("2.4. Сортування за алфавітом Email:", crm.sortByEmailWithPurpose());
}

if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", () => {
        runConsoleAudit();
        renderServicesTable();
        renderUsersTable();

        document.getElementById("btn-sort-duration")?.addEventListener("click", handleSortByDuration);
        document.getElementById("btn-leader-day2")?.addEventListener("click", handleFindLeaderDay2);
        document.getElementById("btn-add-incomplete")?.addEventListener("click", handleAddIncompleteService);
        document.getElementById("btn-add-complete")?.addEventListener("click", handleAddCompleteService);
        document.getElementById("btn-reset-services")?.addEventListener("click", handleResetServices);

        document.getElementById("btn-filter-users")?.addEventListener("click", handleFilterUsers);
        document.getElementById("btn-youngest-user")?.addEventListener("click", handleFindYoungestUser);
        document.getElementById("btn-segment-users")?.addEventListener("click", handleSegmentUsers);
        document.getElementById("btn-sort-users")?.addEventListener("click", handleSortUsersByEmail);
        document.getElementById("btn-reset-users")?.addEventListener("click", handleResetUsers);
    });
} else {
    runConsoleAudit();
}
