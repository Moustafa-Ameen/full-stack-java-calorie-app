document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let dailyLogs = {};
    let customFoods = [];
    let currentDate = new Date();
    let userGoals = { calories: 2000, protein: 150, carbs: 250, fat: 65 };
    let baseNutrients = {}; // Will store the raw nutrient data for the selected food
    let calorieChart;
    let debounceTimer;

    // --- DOM Selections (Ensure all elements exist in HTML) ---
    const consumedEl = document.getElementById('consumed-calories');
    const goalCaloriesDisplayEl = document.getElementById('goal-calories-display');
    const proteinTotalEl = document.getElementById('protein-total');
    const carbsTotalEl = document.getElementById('carbs-total');
    const fatTotalEl = document.getElementById('fat-total');
    const proteinGoalEl = document.getElementById('protein-goal');
    const carbsGoalEl = document.getElementById('carbs-goal');
    const fatGoalEl = document.getElementById('fat-goal');
    const proteinBar = document.getElementById('protein-bar');
    const carbsBar = document.getElementById('carbs-bar');
    const fatBar = document.getElementById('fat-bar');
    const foodList = document.getElementById('food-list');
    const emptyState = document.getElementById('empty-state');
    const chartCanvas = document.getElementById('calorie-chart').getContext('2d');
    const foodForm = document.getElementById('food-form');
    const foodSearchInput = document.getElementById('food-search-input');
    const searchResults = document.getElementById('search-results');
    const servingSizeInput = document.getElementById('serving-size');
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const manualAddModal = document.getElementById('manual-add-modal');
    const manualAddForm = document.getElementById('manual-add-form');
    const settingsModal = document.getElementById('settings-modal');
    const goalForm = document.getElementById('goal-form');
    const calculatorForm = document.getElementById('calculator-form');
    const prevDayBtn = document.getElementById('prev-day-btn');
    const nextDayBtn = document.getElementById('next-day-btn');
    const currentDateDisplay = document.getElementById('current-date-display');
    const menuBtn = document.getElementById('menu-btn');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const settingsMenuBtn = document.getElementById('settings-menu-btn');
    const openManualAddBtn = document.getElementById('open-manual-add-btn');
    const myFoodsListEl = document.getElementById('my-foods-list');
    const noMyFoodsStateEl = document.getElementById('no-my-foods-state');
    const editMyFoodModal = document.getElementById('edit-my-food-modal');
    const editMyFoodForm = document.getElementById('edit-my-food-form');

    // --- API HELPER ---
    const API_BASE_URL = '/api';

    const fetchApi = async (endpoint, options = {}) => {
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${errorText}`);
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return response.json();
        }
    };

    // --- UTILITY FUNCTIONS ---
    const formatDate = (date) => date.toISOString().split('T')[0];

    // --- SCALE NUTRIENTS ---
    const scaleNutrients = () => {
        const newSize = parseFloat(servingSizeInput.value) || 0;
        if (Object.keys(baseNutrients).length === 0) return;

        const baseServingSize = baseNutrients.serving_weight_grams || 1;

        const caloriesPerGram = (baseNutrients.nf_calories || 0) / baseServingSize;
        const proteinPerGram = (baseNutrients.nf_protein || 0) / baseServingSize;
        const carbsPerGram = (baseNutrients.nf_total_carbohydrate || 0) / baseServingSize;
        const fatPerGram = (baseNutrients.nf_total_fat || 0) / baseServingSize;

        document.getElementById('calories').value = Math.round(caloriesPerGram * newSize);
        document.getElementById('protein').value = Math.round(proteinPerGram * newSize);
        document.getElementById('carbs').value = Math.round(carbsPerGram * newSize);
        document.getElementById('fat').value = Math.round(fatPerGram * newSize);
    };

    // --- DELETE CUSTOM FOOD FUNCTION ---
    const deleteCustomFood = async (foodId) => {
        try {
            await fetchApi(`/custom-foods/${foodId}`, { method: 'DELETE' });
            customFoods = customFoods.filter(f => f.id !== foodId);
            render();
        } catch (error) {
            console.error("Failed to delete custom food:", error);
            // Check if endpoint exists
            if (error.message.includes('404')) {
                alert("Delete endpoint not implemented yet. Please add DELETE /api/custom-foods/{id} to your backend.");
            } else {
                alert("Could not delete custom food: " + error.message);
            }
        }
    };

    // --- CORE RENDER FUNCTION ---
    const render = () => {
        try {
            const dateKey = formatDate(currentDate);
            const logsForDate = dailyLogs[dateKey] || [];

            // Safely access goalForm elements only if goalForm exists
            if (goalForm) {
                document.getElementById('calorie-goal-input').value = userGoals.calories;
            } else {
                 console.warn("⚠️ Goal form element not found during render. Cannot set goal input value.");
            }
            proteinGoalEl.textContent = userGoals.protein;
            carbsGoalEl.textContent = userGoals.carbs;
            fatGoalEl.textContent = userGoals.fat;
            const totals = logsForDate.reduce((acc, log) => ({ calories: acc.calories + log.calories, protein: acc.protein + log.protein, carbs: acc.carbs + log.carbs, fat: acc.fat + log.fat }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
            consumedEl.textContent = totals.calories;
            goalCaloriesDisplayEl.textContent = userGoals.calories;
            proteinTotalEl.textContent = totals.protein;
            carbsTotalEl.textContent = totals.carbs;
            fatTotalEl.textContent = totals.fat;
            proteinBar.style.width = userGoals.protein > 0 ? `${Math.min((totals.protein / userGoals.protein) * 100, 100)}%` : '0%';
            carbsBar.style.width = userGoals.carbs > 0 ? `${Math.min((totals.carbs / userGoals.carbs) * 100, 100)}%` : '0%';
            fatBar.style.width = userGoals.fat > 0 ? `${Math.min((totals.fat / userGoals.fat) * 100, 100)}%` : '0%';
            const chartData = { datasets: [{ data: [totals.calories, Math.max(0, userGoals.calories - totals.calories)], backgroundColor: totals.calories > userGoals.calories ? ['#e74c3c', '#e9ecef'] : ['#27ae60', '#e9ecef'], borderWidth: 0 }] };
            if (calorieChart) { calorieChart.data = chartData; calorieChart.update(); } else { calorieChart = new Chart(chartCanvas, { type: 'doughnut', data: chartData, options: { cutout: '80%', plugins: { tooltip: { enabled: false } }, responsive: true, maintainAspectRatio: false } }); }
            emptyState.classList.toggle('hidden', logsForDate.length > 0);
            foodList.innerHTML = logsForDate.map(log => `<li class="flex justify-between items-center bg-slate-50 p-3 rounded-md shadow-sm"><div><p class="font-medium">${log.foodName}</p><p class="text-sm text-slate-500">${log.calories} kcal &bull; P: ${log.protein}g C: ${log.carbs}g F: ${log.fat}g</p></div><div class="flex gap-2"><button class="edit-btn text-slate-500 hover:text-indigo-600" data-id="${log.id}">✏️</button><button class="delete-btn text-slate-500 hover:text-red-600" data-id="${log.id}">🗑️</button></div></li>`).join('');
            const today = new Date(); today.setHours(0, 0, 0, 0); currentDate.setHours(0, 0, 0, 0);
            currentDateDisplay.textContent = (currentDate.getTime() === today.getTime()) ? 'Today' : currentDate.toLocaleString(undefined, { weekday: 'short', month: 'long', day: 'numeric' });

            // --- Populate "My Foods" list ---
            if (myFoodsListEl) {
                if (customFoods.length === 0) {
                    myFoodsListEl.innerHTML = '';
                    if (noMyFoodsStateEl) noMyFoodsStateEl.classList.remove('hidden');
                } else {
                    myFoodsListEl.innerHTML = customFoods.map(food => `
                        <li class="flex justify-between items-center bg-slate-50 p-3 rounded-md shadow-sm">
                            <div class="cursor-pointer flex-1" data-myfood='${JSON.stringify(food)}'>
                                <p class="font-medium text-sm text-slate-700">${food.foodName}</p>
                                <p class="text-xs text-slate-500">${food.calories} kcal</p>
                            </div>
                            <div class="flex gap-2">
                                <button class="edit-my-food-btn text-slate-500 hover:text-indigo-600" data-id="${food.id}">✏️</button>
                                <button class="delete-my-food-btn text-slate-500 hover:text-red-600" data-id="${food.id}">🗑️</button>
                            </div>
                        </li>
                    `).join('');
                    if (noMyFoodsStateEl) noMyFoodsStateEl.classList.add('hidden');
                }
            } else {
                console.warn("⚠️ myFoodsListEl not found during render.");
            }

        } catch (error) {
             console.error("❌ Error during render:", error);
        }
    };

    // --- FETCH LOGS FOR DATE ---
    const fetchLogsForDate = async (date) => {
        const dateKey = formatDate(date);
        try { const logs = await fetchApi(`/logs?date=${dateKey}`); dailyLogs[dateKey] = logs; render(); }
        catch (error) { console.error("Failed to fetch logs:", error); dailyLogs[dateKey] = []; render(); }
    };

    // --- LIVE FOOD SEARCH FUNCTION ---
    const performFoodSearch = async (query) => {
        if (!query) {
            searchResults.classList.add('hidden');
            return;
        }
        try {
            const apiResults = await fetchApi(`/food/search?query=${encodeURIComponent(query)}`);
            if (!apiResults || apiResults.length === 0) {
                searchResults.innerHTML = `<div class="p-3 text-slate-500">No results found.</div>`;
            } else {
                searchResults.innerHTML = apiResults.map(food => `
                    <div class="p-3 hover:bg-slate-100 cursor-pointer border-b" data-food='${JSON.stringify(food)}'>
                        <p class="font-medium">${food.food_name}</p>
                        <p class="text-sm text-slate-500">${Math.round(food.nf_calories)} kcal</p>
                    </div>`).join('');
            }
            searchResults.classList.remove('hidden');
        } catch (error) {
            console.error("Food search failed:", error.message);
            searchResults.innerHTML = `<div class="p-3 text-red-500">Search failed. Please try again.</div>`;
            searchResults.classList.remove('hidden');
        }
    };

    const calculateMacros = (calories, preset) => {
        let protein, carbs, fat;
        switch (preset) {
            case 'muscle-gain': protein = Math.round((calories * 0.40) / 4); carbs = Math.round((calories * 0.30) / 4); fat = Math.round((calories * 0.30) / 9); break;
            case 'low-carb': protein = Math.round((calories * 0.40) / 4); carbs = Math.round((calories * 0.20) / 4); fat = Math.round((calories * 0.40) / 9); break;
            default: protein = Math.round((calories * 0.30) / 4); carbs = Math.round((calories * 0.40) / 4); fat = Math.round((calories * 0.30) / 9);
        }
        return { protein, carbs, fat };
    };

    // --- EVENT LISTENERS SETUP ---
    const setupEventListeners = () => {
        console.log("🚀 Setting up event listeners...");

        if (foodSearchInput) foodSearchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();
            debounceTimer = setTimeout(() => { performFoodSearch(query); }, 300);
        }); else console.error("❌ foodSearchInput not found");

        if (servingSizeInput) servingSizeInput.addEventListener('input', scaleNutrients);
        else console.error("❌ servingSizeInput not found");

        if (searchResults) searchResults.addEventListener('click', (e) => {
            const foodItem = e.target.closest('[data-food]');
            if (foodItem) {
                const foodData = JSON.parse(foodItem.dataset.food);
                baseNutrients = foodData;

                document.getElementById('foodName').value = foodData.food_name;
                servingSizeInput.value = foodData.serving_weight_grams || 100;

                scaleNutrients();

                searchResults.classList.add('hidden');
                foodSearchInput.value = '';
            }
        }); else console.error("❌ searchResults not found");

        // --- Event Listener for "My Foods" list clicks ---
        if (myFoodsListEl) {
            myFoodsListEl.addEventListener('click', (e) => {
                // Handle edit button
                if (e.target.closest('.edit-my-food-btn')) {
                    const btn = e.target.closest('.edit-my-food-btn');
                    const foodId = parseInt(btn.dataset.id);
                    const food = customFoods.find(f => f.id === foodId);
                    if (food && editMyFoodForm) {
                        editMyFoodForm.elements['edit-my-food-id'].value = food.id;
                        editMyFoodForm.elements['edit-my-food-name'].value = food.foodName;
                        editMyFoodForm.elements['edit-my-food-calories'].value = food.calories;
                        editMyFoodForm.elements['edit-my-food-protein'].value = food.protein;
                        editMyFoodForm.elements['edit-my-food-carbs'].value = food.carbs;
                        editMyFoodForm.elements['edit-my-food-fat'].value = food.fat;
                        editMyFoodModal.classList.add('active');
                    }
                    return;
                }

                // Handle delete button
                if (e.target.closest('.delete-my-food-btn')) {
                    const btn = e.target.closest('.delete-my-food-btn');
                    const foodId = parseInt(btn.dataset.id);
                    deleteCustomFood(foodId);
                    return;
                }

                // Handle clicking on food item to fill form
                const foodItem = e.target.closest('[data-myfood]');
                if (foodItem) {
                    const foodData = JSON.parse(foodItem.dataset.myfood);

                    baseNutrients = {
                        food_name: foodData.foodName,
                        nf_calories: foodData.calories,
                        nf_protein: foodData.protein,
                        nf_total_carbohydrate: foodData.carbs,
                        nf_total_fat: foodData.fat,
                        serving_weight_grams: 100
                     };

                    document.getElementById('foodName').value = foodData.foodName;
                    servingSizeInput.value = 100;

                    scaleNutrients();
                }
            });
        } else {
            console.error("❌ myFoodsListEl not found for listener setup");
        }

        if (foodForm) foodForm.addEventListener('submit', async (e) => {
            e.preventDefault();
             const foodNameValue = document.getElementById('foodName').value;
             if (!foodNameValue || foodNameValue === "Select a food from search") {
                alert("Please select a food first.");
                return;
            }
            const newLog = {
                foodName: foodNameValue,
                calories: parseInt(document.getElementById('calories').value) || 0,
                protein: parseInt(document.getElementById('protein').value) || 0,
                carbs: parseInt(document.getElementById('carbs').value) || 0,
                fat: parseInt(document.getElementById('fat').value) || 0,
                logDate: formatDate(currentDate)
            };
             try {
                const savedLog = await fetchApi('/logs', { method: 'POST', body: JSON.stringify(newLog) });
                const dateKey = formatDate(currentDate);
                if (!dailyLogs[dateKey]) dailyLogs[dateKey] = [];
                dailyLogs[dateKey].push(savedLog);

                foodForm.reset();
                document.getElementById('foodName').placeholder = "Select a food from search";
                servingSizeInput.value = 100;
                baseNutrients = {};

                render();
             } catch (error) {
                 console.error("Failed to save log:", error);
                 alert("Could not save food log. Please try again.");
             }
        }); else console.error("❌ foodForm not found");

        if (foodList) foodList.addEventListener('click', async (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            const logId = parseInt(target.dataset.id);
            const dateKey = formatDate(currentDate);
            if (target.classList.contains('delete-btn')) {
                 try {
                    await fetchApi(`/logs/${logId}`, { method: 'DELETE' });
                    dailyLogs[dateKey] = dailyLogs[dateKey].filter(log => log.id !== logId);
                    render();
                 } catch (error) {
                     console.error("Failed to delete log:", error);
                     alert("Could not delete log.");
                 }
            }
            if (target.classList.contains('edit-btn')) {
                const log = dailyLogs[dateKey].find(l => l.id === logId);
                if (log) {
                    editForm.elements['edit-id'].value = log.id;
                    editForm.elements['edit-foodName'].value = log.foodName;
                    editForm.elements['edit-calories'].value = log.calories;
                    editForm.elements['edit-protein'].value = log.protein;
                    editForm.elements['edit-carbs'].value = log.carbs;
                    editForm.elements['edit-fat'].value = log.fat;
                    editModal.classList.add('active');
                }
            }
        }); else console.error("❌ foodList not found");

        if (editForm) editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const logId = parseInt(e.target.elements['edit-id'].value);
            const updatedLog = {
                foodName: e.target.elements['edit-foodName'].value,
                calories: parseInt(e.target.elements['edit-calories'].value) || 0,
                protein: parseInt(e.target.elements['edit-protein'].value) || 0,
                carbs: parseInt(e.target.elements['edit-carbs'].value) || 0,
                fat: parseInt(e.target.elements['edit-fat'].value) || 0
            };
             try {
                const savedLog = await fetchApi(`/logs/${logId}`, { method: 'PUT', body: JSON.stringify(updatedLog) });
                const dateKey = formatDate(currentDate);
                const logIndex = dailyLogs[dateKey].findIndex(l => l.id === logId);
                if (logIndex > -1) dailyLogs[dateKey][logIndex] = savedLog;
                editModal.classList.remove('active');
                render();
             } catch (error) {
                 console.error("Failed to update log:", error);
                 alert("Could not update log.");
             }
        }); else console.error("❌ editForm not found");

        if (manualAddForm) manualAddForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newCustomFood = {
                foodName: e.target.elements['manual-foodName'].value,
                calories: parseInt(e.target.elements['manual-calories'].value) || 0,
                protein: parseInt(e.target.elements['manual-protein'].value) || 0,
                carbs: parseInt(e.target.elements['manual-carbs'].value) || 0,
                fat: parseInt(e.target.elements['manual-fat'].value) || 0
            };
             try {
                const savedFood = await fetchApi('/custom-foods', { method: 'POST', body: JSON.stringify(newCustomFood) });
                customFoods.push(savedFood);
                e.target.reset();
                manualAddModal.classList.remove('active');
                render();
             } catch (error) {
                 console.error("Failed to save custom food:", error);
                 alert("Could not save custom food.");
             }
        }); else console.error("❌ manualAddForm not found");

        if (prevDayBtn) prevDayBtn.addEventListener('click', () => { currentDate.setDate(currentDate.getDate() - 1); fetchLogsForDate(currentDate); });
        else console.error("❌ prevDayBtn not found");
        if (nextDayBtn) nextDayBtn.addEventListener('click', () => { currentDate.setDate(currentDate.getDate() + 1); fetchLogsForDate(currentDate); });
        else console.error("❌ nextDayBtn not found");

        if (goalForm) goalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newCalorieGoal = parseInt(document.getElementById('calorie-goal-input').value) || 2000;
             try {
                await fetchApi('/user/goal', { method: 'PUT', body: JSON.stringify({ goal: newCalorieGoal }) });
                const macroPreset = document.getElementById('macro-goal-select').value;
                userGoals = { calories: newCalorieGoal, ...calculateMacros(newCalorieGoal, macroPreset) };
                settingsModal.classList.remove('active');
                render();
             } catch (error) {
                 console.error("Failed to save goal:", error);
                 alert("Could not save goal.");
             }
        }); else console.error("❌ goalForm not found");

        if (calculatorForm) calculatorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const ageEl = document.getElementById('age');
            const genderEl = document.getElementById('gender');
            const weightEl = document.getElementById('weight');
            const heightEl = document.getElementById('height');
            const activityEl = document.getElementById('activity');

            if(!ageEl || !genderEl || !weightEl || !heightEl || !activityEl) {
                 console.error("Missing calculator form elements.");
                 return;
            }

            const age = parseInt(ageEl.value);
            const gender = genderEl.value;
            const weight = parseFloat(weightEl.value);
            const height = parseFloat(heightEl.value);
            const activity = parseFloat(activityEl.value);

            if (isNaN(age) || isNaN(weight) || isNaN(height)) {
                alert("Please fill in all calculator fields with valid numbers.");
                return;
            }
            let bmr = (gender === 'male') ? (10 * weight + 6.25 * height - 5 * age + 5) : (10 * weight + 6.25 * height - 5 * age - 161);
            const tdee = Math.round(bmr * activity);
            const calculatorResultsEl = document.getElementById('calculator-results');
            if(calculatorResultsEl) {
                calculatorResultsEl.innerHTML = `<div class="bg-slate-100 p-4 rounded-lg"><h3 class="font-bold text-lg mb-2">Calculated Maintenance:</h3><p class="text-gray-700"><strong>${tdee}</strong> calories/day</p><button id="use-maintenance-btn" data-calories="${tdee}" class="mt-2 text-sm text-indigo-600 font-semibold hover:underline">Use as my calorie goal</button></div>`;

                const useMaintenanceBtn = document.getElementById('use-maintenance-btn');
                if(useMaintenanceBtn) {
                     useMaintenanceBtn.addEventListener('click', (event) => {
                        const calories = event.target.dataset.calories;
                        document.getElementById('calorie-goal-input').value = calories;
                        if(goalForm) goalForm.dispatchEvent(new Event('submit', { bubbles: true }));
                     });
                 } else {
                     console.error("Could not find 'use-maintenance-btn'.");
                 }
             } else {
                 console.error("Could not find 'calculator-results' div.");
             }
        }); else console.error("❌ calculatorForm not found");

        if (menuBtn) menuBtn.addEventListener('click', () => { sideMenu.classList.remove('translate-x-full'); menuOverlay.classList.remove('hidden'); });
        else console.error("❌ menuBtn not found");
        if (closeMenuBtn) closeMenuBtn.addEventListener('click', () => { sideMenu.classList.add('translate-x-full'); menuOverlay.classList.add('hidden'); });
        else console.error("❌ closeMenuBtn not found");
        if (menuOverlay) menuOverlay.addEventListener('click', () => { sideMenu.classList.add('translate-x-full'); menuOverlay.classList.add('hidden'); });
        else console.error("❌ menuOverlay not found");
        if (settingsMenuBtn) settingsMenuBtn.addEventListener('click', () => {
            sideMenu.classList.add('translate-x-full');
            menuOverlay.classList.add('hidden');
            settingsModal.classList.add('active');
            document.getElementById('calorie-goal-input').value = userGoals.calories;
        }); else console.error("❌ settingsMenuBtn not found");

        document.querySelectorAll('.close-modal-btn').forEach(btn => {
             if(btn) btn.addEventListener('click', (e) => {
                 const modal = e.target.closest('.modal');
                 if (modal) modal.classList.remove('active');
             });
             else console.error("❌ close-modal-btn not found");
         });

        if (openManualAddBtn) openManualAddBtn.addEventListener('click', () => manualAddModal.classList.add('active'));
        else console.error("❌ openManualAddBtn not found");

        // --- Edit My Food Form Submit ---
        if (editMyFoodForm) editMyFoodForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const foodId = parseInt(e.target.elements['edit-my-food-id'].value);
            const updatedFood = {
                foodName: e.target.elements['edit-my-food-name'].value,
                calories: parseInt(e.target.elements['edit-my-food-calories'].value) || 0,
                protein: parseInt(e.target.elements['edit-my-food-protein'].value) || 0,
                carbs: parseInt(e.target.elements['edit-my-food-carbs'].value) || 0,
                fat: parseInt(e.target.elements['edit-my-food-fat'].value) || 0
            };
            try {
                const savedFood = await fetchApi(`/custom-foods/${foodId}`, { method: 'PUT', body: JSON.stringify(updatedFood) });
                const foodIndex = customFoods.findIndex(f => f.id === foodId);
                if (foodIndex > -1) customFoods[foodIndex] = savedFood;
                editMyFoodModal.classList.remove('active');
                render();
            } catch (error) {
                console.error("Failed to update custom food:", error);
                // Check if endpoint exists
                if (error.message.includes('404')) {
                    alert("Update endpoint not implemented yet. Please add PUT /api/custom-foods/{id} to your backend.");
                } else {
                    alert("Could not update custom food: " + error.message);
                }
            }
        }); else console.error("❌ editMyFoodForm not found");

        console.log("✅ Event listeners attached.");
    };

    // --- INITIAL LOAD ---
    const init = async () => {
        try {
            console.log("🚀 Initializing application...");
            const [userProfile, logs, foods] = await Promise.all([
                fetchApi('/user/me'),
                fetchApi(`/logs?date=${formatDate(currentDate)}`),
                fetchApi('/custom-foods')
            ]);

            const calorieGoal = userProfile.calorieGoal || 2000;
            userGoals = { calories: calorieGoal, ...calculateMacros(calorieGoal, 'balanced') };
            dailyLogs[formatDate(currentDate)] = logs;
            customFoods = foods;

            setupEventListeners();
            render();
            console.log("✅ Application initialized successfully.");
        } catch (error) {
            console.error("❌ Failed to load initial data:", error);
             document.body.innerHTML = '<div class="p-4 text-red-600 text-center">Could not load application data.<br>Please ensure the Java backend server is running and refresh the page.</div>';
        }
    };

    init();
});