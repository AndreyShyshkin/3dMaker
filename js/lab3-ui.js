document.addEventListener('DOMContentLoaded', () => {
    let currentServices = cloneServices(initialServicesData);
    const userManager = createDefaultUserManager();

    const servicesTableBody = document.getElementById('services-table-body');
    const servicesSortBtn = document.getElementById('btn-sort-duration');
    const servicesMaxBtn = document.getElementById('btn-find-max-day2');
    const durationAnalysisContainer = document.getElementById('duration-analysis-output');
    const maxDay2Container = document.getElementById('max-day2-output');
    const addServiceForm = document.getElementById('add-service-form');
    const addServiceStatus = document.getElementById('add-service-status');
    const demoCompleteBtn = document.getElementById('btn-demo-complete');
    const demoIncompleteBtn = document.getElementById('btn-demo-incomplete');
    const simultaneousCalcContainer = document.getElementById('simultaneous-calc-output');
    const serviceCheckboxesList = document.getElementById('service-checkboxes-list');

    const usersTableBody = document.getElementById('users-table-body');
    const userFilterMonth = document.getElementById('user-filter-month');
    const userFilterTime = document.getElementById('user-filter-time');
    const btnFilterUsers = document.getElementById('btn-filter-users');
    const btnResetUserFilter = document.getElementById('btn-reset-user-filter');
    const usersFilteredOutput = document.getElementById('users-filtered-output');
    const youngestCardContainer = document.getElementById('youngest-user-output');
    const classificationCardsContainer = document.getElementById('classification-cards-output');
    const btnSortEmail = document.getElementById('btn-sort-email');
    const sortedEmailContainer = document.getElementById('sorted-email-output');
    const consoleOutput = document.getElementById('interactive-console-log');

    function logToUiConsole(title, data) {
        if (!consoleOutput) return;
        const timestamp = new Date().toLocaleTimeString();
        let formattedData = '';
        if (typeof data === 'object') {
            formattedData = JSON.stringify(data, null, 2);
        } else {
            formattedData = String(data);
        }
        consoleOutput.textContent = `[${timestamp}] ${title}\n${formattedData}\n\n` + consoleOutput.textContent;
    }

    function renderServicesTable(list) {
        if (!servicesTableBody) return;
        servicesTableBody.innerHTML = '';
        list.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td align="center"><strong>${index + 1}</strong></td>
                <td><code>${item.id || '—'}</code></td>
                <td><strong>${item.name || '—'}</strong></td>
                <td><span class="tech-badge">${item.serviceType || '—'}</span></td>
                <td align="center">${item.usersDay1 ?? '—'}</td>
                <td align="center">${item.usersDay2 ?? '—'}</td>
                <td align="center"><strong>${item.durationHours !== undefined ? item.durationHours + ' год' : '—'}</strong></td>
                <td align="right"><strong>${item.cost !== undefined ? item.cost + ' грн' : '—'}</strong></td>
            `;
            servicesTableBody.appendChild(tr);
        });
    }

    function renderServiceCheckboxes(list) {
        if (!serviceCheckboxesList) return;
        serviceCheckboxesList.innerHTML = '';
        list.forEach((item, idx) => {
            const label = document.createElement('label');
            label.className = 'calc-checkbox-label';
            const isChecked = idx < 2 ? 'checked' : '';
            label.innerHTML = `
                <input type="checkbox" value="${item.id}" ${isChecked} class="simultaneous-checkbox">
                <span><strong>${item.name}</strong> (${item.durationHours} год | ${item.serviceType})</span>
            `;
            serviceCheckboxesList.appendChild(label);
        });
        updateSimultaneousDuration();
    }

    function updateSimultaneousDuration() {
        if (!simultaneousCalcContainer || !serviceCheckboxesList) return;
        const checkedBoxes = Array.from(serviceCheckboxesList.querySelectorAll('.simultaneous-checkbox:checked'));
        const selectedIds = checkedBoxes.map(cb => cb.value);
        const selectedServices = currentServices.filter(s => selectedIds.includes(s.id));

        const result = calculateSimultaneousDuration(selectedServices);

        logToUiConsole('Розрахунок одночасної тривалості сервісів', result);
        console.log('Розрахунок одночасної тривалості сервісів:', result);

        let badgeColor = '#047857';
        let ruleText = '1 сервіс: коефіцієнт ×1.0';
        if (result.count > 3) {
            badgeColor = '#b91c1c';
            ruleText = 'Більше 3-х сервісів: тривалість кожного подвоюється (×2.0)';
        } else if (result.count >= 2) {
            badgeColor = '#b58900';
            ruleText = 'До 3-х сервісів: тривалість кожного збільшується на 10% (×1.1)';
        }

        simultaneousCalcContainer.innerHTML = `
            <div class="result-summary-box">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <span style="font-size: 0.9rem; color: var(--color-text-muted);">Обрано послуг:</span>
                        <strong style="font-size: 1.2rem; margin-left: 6px;">${result.count} шт.</strong>
                    </div>
                    <div>
                        <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-weight: 700; font-size: 0.85rem; background: ${badgeColor}15; color: ${badgeColor}; border: 1px solid ${badgeColor}40;">
                            Коефіцієнт: ×${result.multiplier}
                        </span>
                    </div>
                    <div>
                        <span style="font-size: 0.9rem; color: var(--color-text-muted);">Початкова сума:</span>
                        <span style="text-decoration: line-through; margin-left: 6px;">${result.originalTotal} год</span>
                    </div>
                    <div>
                        <span style="font-size: 0.9rem; color: var(--color-text-muted);">Розрахована тривалість:</span>
                        <strong style="font-size: 1.3rem; color: var(--color-primary-light); margin-left: 6px;">${result.calculatedTotal} год</strong>
                    </div>
                </div>
                <div style="margin-top: 10px; font-size: 0.88rem; color: var(--color-text-muted);">
                    Правило розрахунку: <em>${ruleText}</em>
                </div>
                ${result.items.length > 0 ? `
                    <div style="margin-top: 14px;">
                        <table style="font-size: 0.88rem; margin: 0;">
                            <thead>
                                <tr>
                                    <th>Послуга</th>
                                    <th>Тип</th>
                                    <th align="center">Базовий час</th>
                                    <th align="center">Коефіцієнт</th>
                                    <th align="right">Підсумковий час</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${result.items.map(item => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td>${item.serviceType}</td>
                                        <td align="center">${item.baseDuration} год</td>
                                        <td align="center">×${item.multiplier}</td>
                                        <td align="right"><strong>${item.adjustedDuration} год</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p style="margin-top: 10px; color: var(--color-text-muted);">Оберіть хоча б одну послугу зі списку вище для розрахунку.</p>'}
            </div>
        `;
    }

    if (servicesSortBtn) {
        servicesSortBtn.addEventListener('click', () => {
            const result = sortByDurationAndCalcAverageUsers(currentServices);
            logToUiConsole('Впорядкування за тривалістю та усереднення переглядів', result);
            console.log('Впорядкування за тривалістю та усереднення:', result);

            durationAnalysisContainer.innerHTML = `
                <div class="result-summary-box">
                    <h4>Результати усереднення переглядів за категоріями тривалості:</h4>
                    <table style="margin-top: 10px; font-size: 0.9rem;">
                        <thead>
                            <tr>
                                <th align="center">Тривалість</th>
                                <th align="center">Кількість послуг</th>
                                <th>Послуги в категорії</th>
                                <th align="center">Сер. Доба 1</th>
                                <th align="center">Сер. Доба 2</th>
                                <th align="right">Загальне усереднення (доба 1+2)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${result.durationAnalysis.map(group => `
                                <tr>
                                    <td align="center"><strong>${group.durationHours} год</strong></td>
                                    <td align="center">${group.servicesCount}</td>
                                    <td>${group.servicesNames.join(', ')}</td>
                                    <td align="center">${group.averageDay1}</td>
                                    <td align="center">${group.averageDay2}</td>
                                    <td align="right"><strong style="color: var(--color-primary-light);">${group.overallAverageUsers} користувачів</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            renderServicesTable(result.sortedServices);
        });
    }

    if (servicesMaxBtn) {
        servicesMaxBtn.addEventListener('click', () => {
            const leader = findMaxUsersDay2Service(currentServices);
            logToUiConsole('Лідер переглядів за добу 2', leader);
            console.log('Сервіс із максимальними переглядами за добу 2:', leader);

            if (!leader) return;

            maxDay2Container.innerHTML = `
                <div class="result-summary-box" style="border-left: 4px solid var(--color-accent-gold);">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <span style="font-size: 0.85rem; color: #855f00; font-weight: 700;">🏆 ЛІДЕР ПЕРЕГЛЯДІВ ЗА ДОБУ 2</span>
                            <h3 style="margin: 4px 0;">${leader.name}</h3>
                            <p style="margin: 0; color: var(--color-text-muted); font-size: 0.9rem;">
                                ID: <code>${leader.id}</code> | Тривалість: <strong>${leader.durationHours} год</strong> | Вартість: <strong>${leader.cost} грн</strong>
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 0.85rem; color: var(--color-text-muted);">Тип сервісу:</span>
                            <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-primary);">${leader.serviceType}</div>
                            <div style="font-size: 1.3rem; font-weight: 900; color: #855f00; margin-top: 4px;">${leader.usersDay2} переглядів</div>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    if (demoCompleteBtn) {
        demoCompleteBtn.addEventListener('click', () => {
            document.getElementById('new-srv-id').value = `srv-${currentServices.length + 1}`;
            document.getElementById('new-srv-name').value = '3D-друк термостійким полікарбонатом (PC)';
            document.getElementById('new-srv-type').value = '3D-друк';
            document.getElementById('new-srv-day1').value = '90';
            document.getElementById('new-srv-day2').value = '115';
            document.getElementById('new-srv-duration').value = '36';
            document.getElementById('new-srv-cost').value = '750';
        });
    }

    if (demoIncompleteBtn) {
        demoIncompleteBtn.addEventListener('click', () => {
            document.getElementById('new-srv-id').value = `srv-${currentServices.length + 1}`;
            document.getElementById('new-srv-name').value = 'Експериментальний сервіс біодруку';
            document.getElementById('new-srv-type').value = '';
            document.getElementById('new-srv-day1').value = '45';
            document.getElementById('new-srv-day2').value = '';
            document.getElementById('new-srv-duration').value = '72';
            document.getElementById('new-srv-cost').value = '';
        });
    }

    if (addServiceForm) {
        addServiceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const idVal = document.getElementById('new-srv-id').value.trim();
            const nameVal = document.getElementById('new-srv-name').value.trim();
            const typeVal = document.getElementById('new-srv-type').value.trim();
            const day1Val = document.getElementById('new-srv-day1').value.trim();
            const day2Val = document.getElementById('new-srv-day2').value.trim();
            const durVal = document.getElementById('new-srv-duration').value.trim();
            const costVal = document.getElementById('new-srv-cost').value.trim();

            const newServiceData = {
                id: idVal,
                name: nameVal,
                serviceType: typeVal,
                usersDay1: day1Val !== '' ? Number(day1Val) : undefined,
                usersDay2: day2Val !== '' ? Number(day2Val) : undefined,
                durationHours: durVal !== '' ? Number(durVal) : undefined,
                cost: costVal !== '' ? Number(costVal) : undefined
            };

            const result = addServiceRecord(currentServices, newServiceData);
            currentServices = result.updatedList;

            logToUiConsole('Результат додавання запису сервісу', {
                method: result.insertionMethod,
                index: result.insertedIndex,
                reason: result.reason,
                record: newServiceData
            });
            console.log('Результат додавання запису:', result);

            addServiceStatus.innerHTML = `
                <div class="result-summary-box" style="border-left: 4px solid ${result.insertionMethod === 'sorted_by_cost' ? '#047857' : '#b58900'};">
                    <strong>${result.insertionMethod === 'sorted_by_cost' ? 'Вставка за вартістю (всі дані наявні):' : 'Додавання в кінець (дані неповні):'}</strong>
                    ${result.reason} (позиція індексу: <strong>#${result.insertedIndex + 1}</strong>).
                </div>
            `;

            renderServicesTable(currentServices);
            renderServiceCheckboxes(currentServices);
            addServiceForm.reset();
        });
    }

    if (serviceCheckboxesList) {
        serviceCheckboxesList.addEventListener('change', () => {
            updateSimultaneousDuration();
        });
    }

    function renderUsersTable(usersList) {
        if (!usersTableBody) return;
        usersTableBody.innerHTML = '';
        usersList.forEach((user, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td align="center"><strong>${idx + 1}</strong></td>
                <td><strong>${user.getFullName()}</strong></td>
                <td align="center">${user.age} р.</td>
                <td><a href="mailto:${user.email}"><code>${user.email}</code></a></td>
                <td><span class="tech-badge">${user.feedbackGoal}</span></td>
                <td align="center">${user.requestDate}</td>
                <td align="center"><strong>${user.requestTime}</strong></td>
                <td><span class="category-pill ${getCategoryClass(user.classify())}">${user.classify()}</span></td>
            `;
            usersTableBody.appendChild(tr);
        });
    }

    function getCategoryClass(category) {
        switch (category) {
            case 'Активна молодь': return 'cat-youth';
            case 'Похилий претензійний': return 'cat-senior';
            case 'Середній без претензій': return 'cat-middle';
            default: return 'cat-other';
        }
    }

    function renderClassificationCards() {
        if (!classificationCardsContainer) return;
        const result = userManager.classifyUsers();
        logToUiConsole('Класифікація користувачів (4 класи)', result);
        console.log('Класифікація користувачів:', result);

        classificationCardsContainer.innerHTML = `
            <div class="classification-grid">
                <div class="class-card class-card-youth">
                    <div class="class-card-header">
                        <span class="class-title">🌱 Активна молодь</span>
                        <span class="class-count">${result.counts['Активна молодь']}</span>
                    </div>
                    <p class="class-rule">Вік &lt; 25 років та мета «побажання»</p>
                    <ul class="class-users-list">
                        ${result.groups['Активна молодь'].map(u => `<li><strong>${u.getFullName()}</strong> (${u.age} р., ${u.email})</li>`).join('')}
                    </ul>
                </div>

                <div class="class-card class-card-senior">
                    <div class="class-card-header">
                        <span class="class-title">⚠️ Похилий претензійний</span>
                        <span class="class-count">${result.counts['Похилий претензійний']}</span>
                    </div>
                    <p class="class-rule">Вік &gt; 60 років та мета «претензія»</p>
                    <ul class="class-users-list">
                        ${result.groups['Похилий претензійний'].map(u => `<li><strong>${u.getFullName()}</strong> (${u.age} р., ${u.email})</li>`).join('')}
                    </ul>
                </div>

                <div class="class-card class-card-middle">
                    <div class="class-card-header">
                        <span class="class-title">💼 Середній без претензій</span>
                        <span class="class-count">${result.counts['Середній без претензій']}</span>
                    </div>
                    <p class="class-rule">25 &lt; вік &lt; 60 та мета не «претензія»</p>
                    <ul class="class-users-list">
                        ${result.groups['Середній без претензій'].map(u => `<li><strong>${u.getFullName()}</strong> (${u.age} р., ${u.email})</li>`).join('')}
                    </ul>
                </div>

                <div class="class-card class-card-other">
                    <div class="class-card-header">
                        <span class="class-title">📁 Інші</span>
                        <span class="class-count">${result.counts['Інші']}</span>
                    </div>
                    <p class="class-rule">Користувачі, що не потрапили в перші три категорії</p>
                    <ul class="class-users-list">
                        ${result.groups['Інші'].map(u => `<li><strong>${u.getFullName()}</strong> (${u.age} р., ${u.feedbackGoal})</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    function renderYoungestUser() {
        if (!youngestCardContainer) return;
        const youngest = userManager.getYoungestUser();
        logToUiConsole('Наймолодший користувач', youngest);
        console.log('Наймолодший користувач:', youngest);

        if (!youngest) return;

        youngestCardContainer.innerHTML = `
            <div class="result-summary-box" style="border-left: 4px solid var(--color-primary);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <span style="font-size: 0.85rem; color: var(--color-primary); font-weight: 700;">👶 НАЙМОЛОДШИЙ КОРИСТУВАЧ</span>
                        <h3 style="margin: 4px 0;">${youngest.fullName}</h3>
                        <p style="margin: 0; color: var(--color-text-muted); font-size: 0.95rem;">
                            E-mail: <a href="mailto:${youngest.email}"><strong>${youngest.email}</strong></a> | Дата звернення: <strong>${youngest.requestDate}</strong>
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 0.85rem; color: var(--color-text-muted);">Мінімальний вік:</span>
                        <div style="font-size: 2rem; font-weight: 900; color: var(--color-primary-light); line-height: 1;">${youngest.minAge} <span style="font-size: 1rem; font-weight: normal;">років</span></div>
                        <span class="tech-badge" style="margin-top: 6px; display: inline-block;">Мета: ${youngest.feedbackGoal}</span>
                    </div>
                </div>
            </div>
        `;
    }

    if (btnFilterUsers) {
        btnFilterUsers.addEventListener('click', () => {
            const month = userFilterMonth ? userFilterMonth.value : '';
            const time = userFilterTime ? userFilterTime.value.trim() : '';

            if (!month) {
                alert('Будь ласка, оберіть місяць для фільтрації');
                return;
            }

            const filtered = userManager.getUsersByMonthAndTime(month, time);
            logToUiConsole(`Фільтрація користувачів (Місяць: ${month}, Час: ${time || 'будь-який'})`, filtered.map(u => u.toJSON()));
            console.log(`Фільтрація користувачів (Місяць: ${month}, Час: ${time}):`, filtered);

            if (usersFilteredOutput) {
                usersFilteredOutput.innerHTML = `
                    <div class="result-summary-box">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong>Знайдено користувачів за критерієм: ${filtered.length}</strong>
                            <span style="font-size: 0.85rem; color: var(--color-text-muted);">Місяць: ${month} | Час: ${time || 'всі години'}</span>
                        </div>
                        ${filtered.length > 0 ? `
                            <table style="margin: 0; font-size: 0.88rem;">
                                <thead>
                                    <tr>
                                        <th>Ім'я</th>
                                        <th align="center">Вік</th>
                                        <th>E-mail</th>
                                        <th>Мета звернення</th>
                                        <th align="center">Дата</th>
                                        <th align="center">Час</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${filtered.map(u => `
                                        <tr>
                                            <td><strong>${u.getFullName()}</strong></td>
                                            <td align="center">${u.age} р.</td>
                                            <td><code>${u.email}</code></td>
                                            <td>${u.feedbackGoal}</td>
                                            <td align="center">${u.requestDate}</td>
                                            <td align="center"><strong>${u.requestTime}</strong></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<p style="margin: 0; color: var(--color-text-muted);">Користувачів із зазначеними параметрами не знайдено.</p>'}
                    </div>
                `;
            }
        });
    }

    if (btnResetUserFilter) {
        btnResetUserFilter.addEventListener('click', () => {
            if (userFilterMonth) userFilterMonth.value = '3';
            if (userFilterTime) userFilterTime.value = '';
            if (usersFilteredOutput) usersFilteredOutput.innerHTML = '';
            renderUsersTable(userManager.getAllUsers());
        });
    }

    if (btnSortEmail) {
        btnSortEmail.addEventListener('click', () => {
            const sorted = userManager.sortByEmail();
            logToUiConsole('Сортування користувачів за алфавітом E-mail із виведенням мети звернення', sorted);
            console.log('Сортування користувачів за E-mail:', sorted);

            if (sortedEmailContainer) {
                sortedEmailContainer.innerHTML = `
                    <div class="result-summary-box">
                        <h4>Алфавітний реєстр E-mail та мети зворотного зв'язку (A-Z):</h4>
                        <table style="margin-top: 10px; font-size: 0.9rem;">
                            <thead>
                                <tr>
                                    <th align="center">#</th>
                                    <th>Адреса електронної пошти (E-mail)</th>
                                    <th>Прізвище та ім'я</th>
                                    <th>Мета зворотного зв'язку</th>
                                    <th align="center">Вік</th>
                                    <th align="center">Дата звернення</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sorted.map((item, i) => `
                                    <tr>
                                        <td align="center"><strong>${i + 1}</strong></td>
                                        <td><a href="mailto:${item.email}"><code>${item.email}</code></a></td>
                                        <td><strong>${item.fullName}</strong></td>
                                        <td><span class="tech-badge" style="background: rgba(43, 76, 104, 0.08); color: var(--color-primary);">${item.feedbackGoal}</span></td>
                                        <td align="center">${item.age} р.</td>
                                        <td align="center">${item.requestDate} (${item.requestTime})</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        });
    }

    renderServicesTable(currentServices);
    renderServiceCheckboxes(currentServices);
    renderUsersTable(userManager.getAllUsers());
    renderYoungestUser();
    renderClassificationCards();

    logToUiConsole('Система ініціалізована. Всі 10 сервісів та 10 облікових записів користувачів завантажено успішно.', {
        servicesCount: currentServices.length,
        usersCount: userManager.getAllUsers().length
    });
});
