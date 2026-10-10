class UserFeedback {
    constructor(lastName, firstName, age, email, feedbackGoal, requestDate, requestTime) {
        this.lastName = String(lastName || '').trim();
        this.firstName = String(firstName || '').trim();
        this.age = Number(age);
        this.email = String(email || '').trim().toLowerCase();
        this.feedbackGoal = String(feedbackGoal || '').trim();
        this.requestDate = String(requestDate || '').trim();
        this.requestTime = String(requestTime || '').trim();
    }

    getFullName() {
        return `${this.lastName} ${this.firstName}`.trim();
    }

    getMonth() {
        if (!this.requestDate) return null;
        const parts = this.requestDate.split('-');
        if (parts.length >= 2) {
            return parseInt(parts[1], 10);
        }
        const d = new Date(this.requestDate);
        return isNaN(d.getTime()) ? null : d.getMonth() + 1;
    }

    matchesMonthAndTime(targetMonth, targetTime) {
        const monthNum = parseInt(targetMonth, 10);
        if (isNaN(monthNum) || this.getMonth() !== monthNum) {
            return false;
        }

        if (!targetTime || String(targetTime).trim() === '') {
            return true;
        }

        const normalizedTargetTime = String(targetTime).trim();
        return this.requestTime === normalizedTargetTime || this.requestTime.startsWith(normalizedTargetTime);
    }

    classify() {
        const goalLower = this.feedbackGoal.toLowerCase();

        if (this.age < 25 && goalLower === 'побажання') {
            return 'Активна молодь';
        }

        if (this.age > 60 && goalLower === 'претензія') {
            return 'Похилий претензійний';
        }

        if (this.age > 25 && this.age < 60 && goalLower !== 'претензія') {
            return 'Середній без претензій';
        }

        return 'Інші';
    }

    toJSON() {
        return {
            lastName: this.lastName,
            firstName: this.firstName,
            fullName: this.getFullName(),
            age: this.age,
            email: this.email,
            feedbackGoal: this.feedbackGoal,
            requestDate: this.requestDate,
            requestTime: this.requestTime,
            category: this.classify()
        };
    }
}

class UserFeedbackManager {
    constructor(initialData = []) {
        this.users = [];
        if (Array.isArray(initialData)) {
            initialData.forEach(item => this.addUser(item));
        }
    }

    addUser(data) {
        const instance = data instanceof UserFeedback
            ? data
            : new UserFeedback(
                data.lastName,
                data.firstName,
                data.age,
                data.email,
                data.feedbackGoal,
                data.requestDate,
                data.requestTime
            );
        this.users.push(instance);
        return instance;
    }

    getAllUsers() {
        return this.users.slice();
    }

    getUsersByMonthAndTime(month, timeMoment) {
        return this.users.filter(user => user.matchesMonthAndTime(month, timeMoment));
    }

    getYoungestUser() {
        if (this.users.length === 0) {
            return null;
        }

        const youngest = this.users.reduce((min, curr) => {
            return curr.age < min.age ? curr : min;
        }, this.users[0]);

        return {
            minAge: youngest.age,
            email: youngest.email,
            requestDate: youngest.requestDate,
            fullName: youngest.getFullName(),
            feedbackGoal: youngest.feedbackGoal,
            user: youngest
        };
    }

    classifyUsers() {
        const classes = {
            'Активна молодь': [],
            'Похилий претензійний': [],
            'Середній без претензій': [],
            'Інші': []
        };

        this.users.forEach(user => {
            const category = user.classify();
            if (classes[category]) {
                classes[category].push(user);
            } else {
                classes['Інші'].push(user);
            }
        });

        const counts = {
            'Активна молодь': classes['Активна молодь'].length,
            'Похилий претензійний': classes['Похилий претензійний'].length,
            'Середній без претензій': classes['Середній без претензій'].length,
            'Інші': classes['Інші'].length
        };

        return {
            groups: classes,
            counts: counts,
            totalCount: this.users.length
        };
    }

    sortByEmail() {
        const sorted = this.users.slice().sort((a, b) => a.email.localeCompare(b.email, 'uk', { sensitivity: 'base' }));
        return sorted.map(user => ({
            email: user.email,
            feedbackGoal: user.feedbackGoal,
            fullName: user.getFullName(),
            age: user.age,
            requestDate: user.requestDate,
            requestTime: user.requestTime,
            category: user.classify()
        }));
    }
}

const initialUsersData = [
    new UserFeedback("Коваленко", "Олексій", 21, "kovalenko.o@gmail.com", "побажання", "2026-03-12", "14:30"),
    new UserFeedback("Мельник", "Софія", 19, "sofia.melnyk@ukr.net", "побажання", "2026-03-15", "11:15"),
    new UserFeedback("Григоренко", "Віктор", 68, "hryhorenko.v@meta.ua", "претензія", "2026-03-18", "14:30"),
    new UserFeedback("Савченко", "Петро", 64, "savchenko.p@kyiv.ua", "претензія", "2026-04-05", "10:20"),
    new UserFeedback("Бондаренко", "Андрій", 32, "andrii.bondar@tech.ua", "консультація", "2026-03-22", "14:30"),
    new UserFeedback("Шевченко", "Марина", 28, "shevchenko.m@design.com", "побажання", "2026-03-12", "15:00"),
    new UserFeedback("Ткаченко", "Дмитро", 45, "tkachenko.d@proto.org", "замовлення", "2026-04-10", "09:30"),
    new UserFeedback("Кравчук", "Ігор", 17, "kravchuk.i@student.ua", "претензія", "2026-03-08", "14:30"),
    new UserFeedback("Павленко", "Надія", 62, "pavlenko.n@gmail.com", "подяка", "2026-04-14", "18:00"),
    new UserFeedback("Лисенко", "Ярослав", 24, "lysenko.y@maker.ua", "співпраця", "2026-05-02", "12:10")
];

function createDefaultUserManager() {
    return new UserFeedbackManager(initialUsersData);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UserFeedback,
        UserFeedbackManager,
        initialUsersData,
        createDefaultUserManager
    };
}
