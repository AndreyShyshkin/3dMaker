const initialServicesData = [
    {
        id: "srv-01",
        name: "FDM-друк прототипів (PLA/PETG)",
        serviceType: "3D-друк",
        usersDay1: 140,
        usersDay2: 185,
        durationHours: 12,
        cost: 350
    },
    {
        id: "srv-02",
        name: "SLA фотополімерний друк високої чіткості",
        serviceType: "3D-друк",
        usersDay1: 95,
        usersDay2: 130,
        durationHours: 24,
        cost: 650
    },
    {
        id: "srv-03",
        name: "SLS спікання поліаміду PA12",
        serviceType: "3D-друк",
        usersDay1: 60,
        usersDay2: 85,
        durationHours: 48,
        cost: 1400
    },
    {
        id: "srv-04",
        name: "Оптичне 3D-сканування деталей",
        serviceType: "3D-сканування",
        usersDay1: 110,
        usersDay2: 125,
        durationHours: 12,
        cost: 500
    },
    {
        id: "srv-05",
        name: "Лазерне 3D-сканування та метрологія",
        serviceType: "3D-сканування",
        usersDay1: 75,
        usersDay2: 90,
        durationHours: 24,
        cost: 950
    },
    {
        id: "srv-06",
        name: "Реверс-інжиніринг та CAD-моделювання",
        serviceType: "CAD-моделювання",
        usersDay1: 130,
        usersDay2: 160,
        durationHours: 48,
        cost: 1200
    },
    {
        id: "srv-07",
        name: "Топологічна оптимізація 3D-моделі",
        serviceType: "CAD-моделювання",
        usersDay1: 85,
        usersDay2: 115,
        durationHours: 24,
        cost: 800
    },
    {
        id: "srv-08",
        name: "Хімічне згладжування поверхонь (Vapor Smoothing)",
        serviceType: "Постобробка",
        usersDay1: 70,
        usersDay2: 105,
        durationHours: 12,
        cost: 300
    },
    {
        id: "srv-09",
        name: "Ґрунтування та фарбування деталей",
        serviceType: "Постобробка",
        usersDay1: 90,
        usersDay2: 110,
        durationHours: 24,
        cost: 450
    },
    {
        id: "srv-10",
        name: "Прямий друк з онлайн-репозиторіїв за посиланням",
        serviceType: "Онлайн-сервіс",
        usersDay1: 210,
        usersDay2: 260,
        durationHours: 12,
        cost: 250
    }
];

function cloneServices(list) {
    return list.map(item => ({ ...item }));
}

function sortByDurationAndCalcAverageUsers(servicesList) {
    const sorted = cloneServices(servicesList).sort((a, b) => a.durationHours - b.durationHours);
    const groupsMap = new Map();

    sorted.forEach(service => {
        if (!groupsMap.has(service.durationHours)) {
            groupsMap.set(service.durationHours, []);
        }
        groupsMap.get(service.durationHours).push(service);
    });

    const durationAnalysis = [];

    groupsMap.forEach((services, duration) => {
        const totalDay1 = services.reduce((acc, curr) => acc + curr.usersDay1, 0);
        const totalDay2 = services.reduce((acc, curr) => acc + curr.usersDay2, 0);
        const avgDay1 = parseFloat((totalDay1 / services.length).toFixed(2));
        const avgDay2 = parseFloat((totalDay2 / services.length).toFixed(2));
        const overallAverage = parseFloat(((totalDay1 + totalDay2) / (services.length * 2)).toFixed(2));

        durationAnalysis.push({
            durationHours: duration,
            servicesCount: services.length,
            servicesNames: services.map(s => s.name),
            averageDay1: avgDay1,
            averageDay2: avgDay2,
            overallAverageUsers: overallAverage
        });
    });

    return {
        sortedServices: sorted,
        durationAnalysis: durationAnalysis
    };
}

function findMaxUsersDay2Service(servicesList) {
    if (!servicesList || servicesList.length === 0) {
        return null;
    }

    const leader = servicesList.reduce((max, current) => {
        return current.usersDay2 > max.usersDay2 ? current : max;
    }, servicesList[0]);

    return {
        id: leader.id,
        name: leader.name,
        serviceType: leader.serviceType,
        usersDay2: leader.usersDay2,
        cost: leader.cost,
        durationHours: leader.durationHours
    };
}

function isServiceRecordComplete(service) {
    if (!service) return false;
    const requiredKeys = ['id', 'name', 'serviceType', 'usersDay1', 'usersDay2', 'durationHours', 'cost'];
    return requiredKeys.every(key => {
        const val = service[key];
        if (val === undefined || val === null) return false;
        if (typeof val === 'string' && val.trim() === '') return false;
        if (typeof val === 'number' && isNaN(val)) return false;
        return true;
    });
}

function addServiceRecord(servicesList, newService) {
    const listCopy = cloneServices(servicesList);
    const isComplete = isServiceRecordComplete(newService);

    if (!isComplete) {
        listCopy.push({ ...newService });
        return {
            updatedList: listCopy,
            insertionMethod: "end",
            insertedIndex: listCopy.length - 1,
            reason: "Запис містить неповні дані або пропущені поля, тому доданий у кінець списку"
        };
    }

    listCopy.sort((a, b) => a.cost - b.cost);

    let insertIndex = listCopy.findIndex(item => item.cost > newService.cost);
    if (insertIndex === -1) {
        insertIndex = listCopy.length;
    }

    listCopy.splice(insertIndex, 0, { ...newService });

    return {
        updatedList: listCopy,
        insertionMethod: "sorted_by_cost",
        insertedIndex: insertIndex,
        reason: "Всі поля заповнені коректно. Список відсортовано за зростанням вартості, запис розміщено на відповідній позиції"
    };
}

function calculateSimultaneousDuration(selectedServices) {
    if (!selectedServices || selectedServices.length === 0) {
        return {
            count: 0,
            multiplier: 1.0,
            originalTotal: 0,
            calculatedTotal: 0,
            items: []
        };
    }

    const count = selectedServices.length;
    let multiplier = 1.0;

    if (count === 1) {
        multiplier = 1.0;
    } else if (count <= 3) {
        multiplier = 1.1;
    } else {
        multiplier = 2.0;
    }

    const items = selectedServices.map(service => {
        const baseDuration = Number(service.durationHours);
        const adjustedDuration = parseFloat((baseDuration * multiplier).toFixed(2));
        return {
            id: service.id,
            name: service.name,
            serviceType: service.serviceType,
            baseDuration: baseDuration,
            multiplier: multiplier,
            adjustedDuration: adjustedDuration
        };
    });

    const originalTotal = items.reduce((sum, item) => sum + item.baseDuration, 0);
    const calculatedTotal = parseFloat(items.reduce((sum, item) => sum + item.adjustedDuration, 0).toFixed(2));

    return {
        count: count,
        multiplier: multiplier,
        originalTotal: originalTotal,
        calculatedTotal: calculatedTotal,
        items: items
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initialServicesData,
        cloneServices,
        sortByDurationAndCalcAverageUsers,
        findMaxUsersDay2Service,
        isServiceRecordComplete,
        addServiceRecord,
        calculateSimultaneousDuration
    };
}
