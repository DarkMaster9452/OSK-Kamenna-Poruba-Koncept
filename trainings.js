// ====================================
// SYSTÉM TRÉNINGOV - OŠK Kamenná Poruba
// ====================================

// Note: Global variables are declared in trainings.html before this script loads:
// - let currentUser
// - let trainings
// - let playerAttendance
// - let parentChildren

// Initialize training HTML structure
function initializeTrainingView() {
    const trainingContainer = document.getElementById('trainingView');
    if (!trainingContainer) return;

    trainingContainer.innerHTML = `
        <section id="trainingSection" style="background: linear-gradient(135deg, #003399 0%, #1a5ccc 100%); color: white; padding: 60px 40px;">
            <div style="max-width: 1400px; margin: 0 auto;">
                <h2 style="border: none; color: white; padding-bottom: 10px; margin-bottom: 30px;">
                    <i class="fas fa-dumbbell"></i> Systém Tréningov
                </h2>

                <!-- Coach's Training Creation Form -->
                <div id="coachCreateTrainingArea" style="display: none; margin-bottom: 40px; background: rgba(255, 255, 255, 0.05); padding: 30px; border-radius: 10px; border: 2px solid #ffd700;">
                    <h3 style="color: #ffd700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-plus-circle"></i> Vytvoriť nový tréning
                    </h3>
                    <form style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; align-items: end;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; color: #ffd700; font-weight: bold;">Dátum:</label>
                            <input type="date" id="coachTrainingDate" style="width: 100%; padding: 10px; border: 1px solid #ffd700; border-radius: 5px; background: rgba(255, 255, 255, 0.1); color: white;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; color: #ffd700; font-weight: bold;">Čas:</label>
                            <input type="time" id="coachTrainingTime" style="width: 100%; padding: 10px; border: 1px solid #ffd700; border-radius: 5px; background: rgba(255, 255, 255, 0.1); color: white;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; color: #ffd700; font-weight: bold;">Typ:</label>
                            <select id="coachTrainingType" style="width: 100%; padding: 10px; border: 1px solid #ffd700; border-radius: 5px; background: rgba(255, 255, 255, 0.1); color: white;">
                                <option value="">-- Vybrať typ --</option>
                                <option value="technical">Technický tréning</option>
                                <option value="tactical">Taktický tréning</option>
                                <option value="physical">Fyzický tréning</option>
                                <option value="friendly">Prieťahový zápas</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; color: #ffd700; font-weight: bold;">Trvanie (min):</label>
                            <input type="number" id="coachTrainingDuration" value="90" min="30" step="15" style="width: 100%; padding: 10px; border: 1px solid #ffd700; border-radius: 5px; background: rgba(255, 255, 255, 0.1); color: white;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; color: #ffd700; font-weight: bold;">Kategória:</label>
                            <select id="coachTrainingCategory" style="width: 100%; padding: 10px; border: 1px solid #ffd700; border-radius: 5px; background: rgba(255, 255, 255, 0.1); color: white;">
                                <option value="">-- Vybrať kategóriu --</option>
                                <option value="pripravky">Prípravky (U8-U9)</option>
                                <option value="ziaci">Žiaci (U10-U12)</option>
                                <option value="dorastenci">Dorastenci (U13-U18)</option>
                                <option value="adults_young">Dospelí - Mladí (18-25)</option>
                                <option value="adults_pro">Dospelí - Skúsení (25+)</option>
                            </select>
                        </div>
                        <div>
                            <button type="button" onclick="createTraining()" style="width: 100%; padding: 12px; background: #ffd700; color: #003399; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s;">
                                <i class="fas fa-plus"></i> Vytvoriť tréning
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Parent Children Management (Read-Only) -->
                <div id="parentChildrenArea" style="display: none; margin-bottom: 40px; background: rgba(255, 255, 255, 0.05); padding: 30px; border-radius: 10px; border: 2px solid #ffd700;">
                    <h3 style="color: #ffd700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-child"></i> Moje deti
                    </h3>
                    <div id="childrenList"></div>
                </div>

                <!-- Player/Parent Training Selection -->
                <div id="playerTrainingArea" style="display: none; margin-bottom: 40px;">
                    <h3 style="color: #ffd700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-calendar-check"></i> Prihlásiť sa na tréning
                    </h3>
                    <div id="playerTrainingsContainer"></div>
                </div>

                <!-- Coach's Training Roster Table -->
                <div id="coachRosterArea" style="display: none;">
                    <h3 style="color: #ffd700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-list"></i> Tréningy a účasť hráčov
                    </h3>
                    <div id="coachTrainingsContainer"></div>
                </div>
            </div>
        </section>
    `;
}

// Load training data from localStorage
function loadTrainingData() {
    const saved = localStorage.getItem('trainings');
    if (saved) {
        trainings = JSON.parse(saved);
    }
    
    const savedAttendance = localStorage.getItem('playerAttendance');
    if (savedAttendance) {
        playerAttendance = JSON.parse(savedAttendance);
    }

    // Load parent's children from database.js instead of localStorage
    if (currentUser && currentUser.role === 'parent' && typeof USERS !== 'undefined') {
        const parentUser = USERS[currentUser.username];
        if (parentUser && parentUser.children) {
            parentChildren = {};
            parentUser.children.forEach(childUsername => {
                parentChildren[childUsername] = true;
            });
        }
    }
}

// Create training (Coach only)
function createTraining() {
    console.log('createTraining called, currentUser:', currentUser);
    
    if (!currentUser || !currentUser.username) {
        alert('Musíte byť prihlásený ako tréner!');
        return;
    }
    
    const date = document.getElementById('coachTrainingDate').value;
    const time = document.getElementById('coachTrainingTime').value;
    const type = document.getElementById('coachTrainingType').value;
    const duration = document.getElementById('coachTrainingDuration').value;
    const category = document.getElementById('coachTrainingCategory').value;

    if (!date || !time || !type || !duration || !category) {
        alert('Prosím vyplňte všetky polia!');
        return;
    }

    const training = {
        id: Date.now(),
        date: date,
        time: time,
        type: type,
        duration: duration,
        category: category,
        createdBy: currentUser.username,
        createdDate: new Date().toISOString(),
        isActive: true,
        attendance: {}
    };

    // Initialize all players in this category with "unknown" status
    const categoryPlayers = getPlayersByCategory(category);
    categoryPlayers.forEach(player => {
        const key = training.id + '_' + player.username;
        training.attendance[key] = 'unknown';
    });

    trainings.push(training);
    localStorage.setItem('trainings', JSON.stringify(trainings));

    alert('Tréning bol úspešne vytvorený! Všetci hráči majú stav "neviem".');
    
    // Clear form
    document.getElementById('coachTrainingDate').value = '';
    document.getElementById('coachTrainingTime').value = '';
    document.getElementById('coachTrainingType').value = '';
    document.getElementById('coachTrainingDuration').value = '90';
    document.getElementById('coachTrainingCategory').value = '';

    refreshCoachRoster();
    refreshPlayerTrainings();
}

// Refresh player trainings view
function refreshPlayerTrainings() {
    const container = document.getElementById('playerTrainingsContainer');
    if (!container) {
        console.error('playerTrainingsContainer not found');
        return;
    }
    
    console.log('refreshPlayerTrainings, trainings:', trainings, 'currentUser:', currentUser);
    
    if (trainings.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #ffd700; padding: 30px;"><p>Zatiaľ nie sú žiadne naplánované tréningy.</p></div>';
        return;
    }

    // Get list of people to track attendance for
    let peopleToDisplay = [currentUser.username];
    if (currentUser.role === 'parent') {
        peopleToDisplay = Object.keys(parentChildren);
    }
    
    if (peopleToDisplay.length === 0 && currentUser.role === 'parent') {
        container.innerHTML = '<div style="text-align: center; color: #ffd700; padding: 30px;"><p>Nemáte pridelené žiadne deti.</p></div>';
        return;
    }

    let html = '';
    trainings.forEach(training => {
        const date = new Date(training.date);
        const formattedDate = date.toLocaleDateString('sk-SK');
        const typeLabel = getTrainingTypeLabel(training.type);
        
        html += `
            <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 10px; margin-bottom: 15px;">
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: center; margin-bottom: 15px;">
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #ffd700; font-size: 16px;">${typeLabel}</h4>
                        <p style="margin: 5px 0; color: rgba(255, 255, 255, 0.8);">
                            <i class="fas fa-calendar"></i> ${formattedDate} o ${training.time}
                        </p>
                        <p style="margin: 5px 0; color: rgba(255, 255, 255, 0.8);">
                            <i class="fas fa-clock"></i> Trvanie: ${training.duration} minút
                        </p>
                        <p style="margin: 5px 0; color: ${training.isActive ? '#2ecc71' : '#e74c3c'}; font-weight: bold;">
                            ${training.isActive ? '🟢 Aktívny tréning' : '🔴 Uzavretý tréning'}
                        </p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">`
        ;
        
        // Show attendance options for each person
        peopleToDisplay.forEach(personName => {
            const trainingKey = training.id + '_' + personName;
            const currentStatus = training.attendance ? training.attendance[trainingKey] : undefined;
            const statusToUse = currentStatus || 'unknown';
            
            html += `
                <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; border-left: 3px solid #ffd700;">
                    <p style="margin: 0 0 10px 0; color: #ffd700; font-size: 12px; font-weight: bold;">${personName}</p>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">`
            ;
            
            if (training.isActive) {
                html += `
                        <button onclick="markAttendance(${training.id}, '${personName}', 'yes')" 
                            style="flex: 1; padding: 8px; border: none; border-radius: 3px; cursor: pointer; font-weight: bold; font-size: 12px; ${statusToUse === 'yes' ? 'background: #2ecc71; color: white;' : 'background: rgba(255, 255, 255, 0.1); color: white;'} transition: all 0.3s;">
                            <i class="fas fa-check"></i> Prídem
                        </button>
                        <button onclick="markAttendance(${training.id}, '${personName}', 'no')" 
                            style="flex: 1; padding: 8px; border: none; border-radius: 3px; cursor: pointer; font-weight: bold; font-size: 12px; ${statusToUse === 'no' ? 'background: #e74c3c; color: white;' : 'background: rgba(255, 255, 255, 0.1); color: white;'} transition: all 0.3s;">
                            <i class="fas fa-times"></i> Neprídnem
                        </button>
                        <button onclick="markAttendance(${training.id}, '${personName}', 'unknown')" 
                            style="flex: 1; padding: 8px; border: none; border-radius: 3px; cursor: pointer; font-weight: bold; font-size: 12px; ${statusToUse === 'unknown' ? 'background: #95a5a6; color: white;' : 'background: rgba(255, 255, 255, 0.1); color: white;'} transition: all 0.3s;">
                            <i class="fas fa-question"></i> Neviem
                        </button>
                `;
            } else {
                const statusLabels = { yes: 'Prídem ✓', no: 'Neprídnem ✗', unknown: 'Neviem ?' };
                const statusColors = { yes: '#2ecc71', no: '#e74c3c', unknown: '#95a5a6' };
                html += `
                        <div style="flex: 1; padding: 8px; border-radius: 3px; background: ${statusColors[statusToUse]}; color: white; text-align: center; font-weight: bold;">
                            ${statusLabels[statusToUse]}
                        </div>
                `;
            }
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Update children list display (read-only)
function updateChildrenList() {
    const childrenList = document.getElementById('childrenList');
    const children = Object.keys(parentChildren);
    
    if (children.length === 0) {
        childrenList.innerHTML = '<p style="color: rgba(255, 255, 255, 0.6); text-align: center;">Nemáte pridelené žiadne deti.</p>';
        return;
    }
    
    let html = '';
    children.forEach((childUsername, index) => {
        // Get child's full name from PLAYERS if available
        const childName = (typeof PLAYERS !== 'undefined' && PLAYERS[childUsername]) 
            ? PLAYERS[childUsername].fullName 
            : childUsername;
        
        html += `
            <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #ffd700; font-weight: bold;">${index + 1}. ${childName}</span>
            </div>
        `;
    });
    childrenList.innerHTML = html;
}

// Mark attendance for player or child
function markAttendance(trainingId, personName, status) {
    // Find the training
    const training = trainings.find(t => t.id === trainingId);
    if (!training) {
        console.error('Training not found:', trainingId);
        return;
    }
    
    // Check if training is active (not locked)
    if (!training.isActive) {
        alert('Tento tréning je už zatvorený a nemôžete zmeniť vašu odpoveď.');
        return;
    }
    
    const trainingKey = trainingId + '_' + personName;
    
    // Store in training attendance object
    if (training.attendance) {
        training.attendance[trainingKey] = status;
    }
    
    // Also store in playerAttendance for backward compatibility
    if (status === 'yes') {
        playerAttendance[trainingKey] = true;
    } else if (status === 'no') {
        playerAttendance[trainingKey] = false;
    } else {
        delete playerAttendance[trainingKey];
    }
    
    localStorage.setItem('trainings', JSON.stringify(trainings));
    localStorage.setItem('playerAttendance', JSON.stringify(playerAttendance));
    
    const statusLabels = { yes: 'Prídem', no: 'Neprídnem', unknown: 'Neviem' };
    const message = personName === currentUser.username ? 
        'Vaša prítomnosť bola upravená na: ' + statusLabels[status] :
        'Prítomnosť ' + personName + ' bola upravená na: ' + statusLabels[status];
    console.log(message);
    
    refreshPlayerTrainings();
    refreshCoachRoster();
}

// Refresh coach roster
function refreshCoachRoster() {
    console.log('refreshCoachRoster called, currentUser:', currentUser, 'trainings:', trainings);
    
    const container = document.getElementById('coachTrainingsContainer');
    if (!container) {
        console.error('coachTrainingsContainer not found');
        return;
    }
    
    if (trainings.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #ffd700; padding: 30px;"><p>Zatiaľ nie sú žiadne vytvorené tréningy.</p></div>';
        return;
    }

    let html = '';
    trainings.forEach(training => {
        const date = new Date(training.date);
        const formattedDate = date.toLocaleDateString('sk-SK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const typeLabel = getTrainingTypeLabel(training.type);
        const categoryLabel = getTrainingCategoryLabel(training.category);
        
        // Get attendance for this training - now with three categories
        let attendingPlayers = [];
        let notAttendingPlayers = [];
        let unknownPlayers = [];

        if (training.attendance) {
            Object.keys(training.attendance).forEach(key => {
                const playerName = key.substring((training.id + '_').length);
                const status = training.attendance[key];
                
                if (status === 'yes') {
                    attendingPlayers.push(playerName);
                } else if (status === 'no') {
                    notAttendingPlayers.push(playerName);
                } else {
                    unknownPlayers.push(playerName);
                }
            });
        }

        const totalExpected = attendingPlayers.length + notAttendingPlayers.length + unknownPlayers.length;
        const attendancePercent = totalExpected > 0 ? Math.round((attendingPlayers.length / totalExpected) * 100) : 0;

        html += `
            <div style="border: 2px solid #ffd700; border-radius: 10px; overflow: hidden; background: rgba(255, 255, 255, 0.02); margin-bottom: 20px;">
                <!-- Training Header -->
                <div style="background: linear-gradient(90deg, rgba(255, 215, 0, 0.2) 0%, rgba(0, 51, 153, 0.2) 100%); padding: 20px; border-bottom: 2px solid #ffd700;">
                    <div style="display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: start;">
                        <div>
                            <h3 style="margin: 0 0 10px 0; color: #ffd700; font-size: 20px;">
                                <i class="fas fa-futbol"></i> ${typeLabel}
                            </h3>
                            <p style="margin: 8px 0; color: rgba(255, 255, 255, 0.9);">
                                <i class="fas fa-calendar"></i> <strong>${formattedDate}</strong>
                            </p>
                            <p style="margin: 8px 0; color: rgba(255, 255, 255, 0.9);">
                                <i class="fas fa-clock"></i> <strong>${training.time}</strong> | <i class="fas fa-hourglass-half"></i> ${training.duration} minút
                            </p>
                            <p style="margin: 8px 0; color: #ffd700; font-weight: bold;">
                                <i class="fas fa-users"></i> Kategória: ${categoryLabel}
                            </p>
                            <p style="margin: 8px 0; color: ${training.isActive ? '#2ecc71' : '#e74c3c'}; font-weight: bold;">
                                ${training.isActive ? '🟢 Aktívny tréning - hráči môžu meniť odpovede' : '🔴 Uzavretý tréning - žiadne zmeny'}
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <div style="background: rgba(46, 204, 113, 0.2); border: 2px solid #2ecc71; padding: 15px 20px; border-radius: 8px; margin-bottom: 10px;">
                                <div style="font-size: 28px; color: #2ecc71; font-weight: bold;">${attendingPlayers.length}</div>
                                <div style="font-size: 12px; color: #2ecc71;">Hráči prídu</div>
                            </div>
                            <div style="background: rgba(46, 204, 113, 0.1); padding: 5px 10px; border-radius: 5px; font-size: 12px; color: #2ecc71; margin-bottom: 10px;">
                                Účasť: ${attendancePercent}%
                            </div>
                            <div style="display: flex; gap: 8px; flex-direction: column;">
                                ${training.isActive ? `
                                    <button onclick="startTraining(${training.id})" style="padding: 8px 12px; background: #f39c12; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px; width: 100%;">
                                        <i class="fas fa-play"></i> Začať tréning
                                    </button>
                                ` : ''}
                                <button onclick="deleteTraining(${training.id})" style="padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px; width: 100%;">
                                    <i class="fas fa-trash"></i> Odstrániť
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Attendance Lists -->
                <div style="padding: 20px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                        <!-- Coming Players -->
                        <div>
                            <h4 style="margin: 0 0 15px 0; color: #2ecc71; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-check-circle"></i> Prídu (${attendingPlayers.length})
                            </h4>
                            <div style="background: rgba(46, 204, 113, 0.1); border: 1px solid rgba(46, 204, 113, 0.3); padding: 15px; border-radius: 8px; min-height: 100px; max-height: 300px; overflow-y: auto;">
                                ${attendingPlayers.length > 0 ? attendingPlayers.map((p, idx) => `
                                    <div style="padding: 10px 0; border-bottom: 1px solid rgba(46, 204, 113, 0.2); color: #2ecc71; display: flex; align-items: center; gap: 8px;">
                                        <span style="display: inline-block; width: 24px; height: 24px; background: #2ecc71; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold;">${idx + 1}</span>
                                        ${p}
                                    </div>
                                `).join('') : '<p style="color: rgba(255, 255, 255, 0.5); margin: 0; text-align: center; padding-top: 30px;">Zatiaľ nikto</p>'}
                            </div>
                        </div>

                        <!-- Not Coming Players -->
                        <div>
                            <h4 style="margin: 0 0 15px 0; color: #e74c3c; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-times-circle"></i> Neprídú (${notAttendingPlayers.length})
                            </h4>
                            <div style="background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); padding: 15px; border-radius: 8px; min-height: 100px; max-height: 300px; overflow-y: auto;">
                                ${notAttendingPlayers.length > 0 ? notAttendingPlayers.map((p, idx) => `
                                    <div style="padding: 10px 0; border-bottom: 1px solid rgba(231, 76, 60, 0.2); color: #e74c3c; display: flex; align-items: center; gap: 8px;">
                                        <span style="display: inline-block; width: 24px; height: 24px; background: #e74c3c; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold;">${idx + 1}</span>
                                        ${p}
                                    </div>
                                `).join('') : '<p style="color: rgba(255, 255, 255, 0.5); margin: 0; text-align: center; padding-top: 30px;">Zatiaľ nikto</p>'}
                            </div>
                        </div>

                        <!-- Unknown Response Players -->
                        <div>
                            <h4 style="margin: 0 0 15px 0; color: #95a5a6; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-question-circle"></i> Nevedia (${unknownPlayers.length})
                            </h4>
                            <div style="background: rgba(149, 165, 166, 0.1); border: 1px solid rgba(149, 165, 166, 0.3); padding: 15px; border-radius: 8px; min-height: 100px; max-height: 300px; overflow-y: auto;">
                                ${unknownPlayers.length > 0 ? unknownPlayers.map((p, idx) => `
                                    <div style="padding: 10px 0; border-bottom: 1px solid rgba(149, 165, 166, 0.2); color: #95a5a6; display: flex; align-items: center; gap: 8px;">
                                        <span style="display: inline-block; width: 24px; height: 24px; background: #95a5a6; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold;">${idx + 1}</span>
                                        ${p}
                                    </div>
                                `).join('') : '<p style="color: rgba(255, 255, 255, 0.5); margin: 0; text-align: center; padding-top: 30px;">Všetci odpovedali</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Start training - lock attendance changes
function startTraining(trainingId) {
    const training = trainings.find(t => t.id === trainingId);
    if (!training) return;

    if (confirm('Naozaj chcete uzavrieť tento tréning? Hráči už nebudú môcť meniť svoje odpovede.')) {
        training.isActive = false;
        localStorage.setItem('trainings', JSON.stringify(trainings));
        alert('Tréning bol uzavretý. Hráči nemôžu meniť svoje odpovede.');
        refreshCoachRoster();
        refreshPlayerTrainings();
    }
}

// Get training category label
function getTrainingCategoryLabel(category) {
    const labels = {
        'pripravky': 'Prípravky (U8-U9)',
        'ziaci': 'Žiaci (U10-U12)',
        'dorastenci': 'Dorastenci (U13-U18)',
        'adults_young': 'Dospelí - Mladí (18-25)',
        'adults_pro': 'Dospelí - Skúsení (25+)'
    };
    return labels[category] || category;
}

// Delete training
function deleteTraining(id) {
    if (confirm('Ste si istý, že chcete odstrániť tento tréning?')) {
        trainings = trainings.filter(t => t.id !== id);
        localStorage.setItem('trainings', JSON.stringify(trainings));
        alert('Tréning bol odstrániť.');
        refreshCoachRoster();
    }
}

// Get training type label
function getTrainingTypeLabel(type) {
    const labels = {
        'technical': '⚽ Technický tréning',
        'tactical': '📋 Taktický tréning',
        'physical': '💪 Fyzický tréning',
        'friendly': '🎯 Prieťahový zápas'
    };
    return labels[type] || type;
}
