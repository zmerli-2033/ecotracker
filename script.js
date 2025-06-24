// Application State
let appState = {
  currentPage: "dashboard",
  activities: [],
  stats: {
    totalCarbon: 0,
    totalEnergy: 0,
    totalSavings: 0,
    ecoScore: 85,
  },
  user: {
    name: "Utilisateur Éco",
    joinDate: "2024-01-01",
    settings: {
      notifications: true,
      dailyReminders: false,
      monthlyGoal: 500,
    },
  },
}

// Ajouter après les variables existantes
let gamificationData = {
  level: 1,
  xp: 0,
  achievements: [],
  streak: 0,
  challenges: [],
}

// Carbon emission factors (kg CO2 per unit)
const EMISSION_FACTORS = {
  transport: {
    car: 0.21, // kg CO2 per km
    bus: 0.08,
    train: 0.04,
    plane: 0.25,
  },
  electricity: 0.5, // kg CO2 per kWh
  heating: {
    gas: 0.18, // kg CO2 per kWh
    oil: 0.25,
    electric: 0.5,
  },
  water: 0.001, // kg CO2 per liter
  waste: 0.5, // kg CO2 per kg
}

// DOM Elements
const navLinks = document.querySelectorAll(".nav-link")
const pages = document.querySelectorAll(".page")
const activityForm = document.getElementById("activity-form")
const quickButtons = document.querySelectorAll(".quick-btn")
const loadingOverlay = document.getElementById("loading-overlay")

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  setupEventListeners()
  loadSampleData()
  updateDashboard()
})

function initializeApp() {
  // Set current date for activity form
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("activity-date").value = today

  // Load data from localStorage
  const savedData = localStorage.getItem("ecoTrackerData")
  if (savedData) {
    appState = { ...appState, ...JSON.parse(savedData) }
  }

  console.log("EcoTracker initialized")
}

// Ajouter après initializeApp()
function initializeGamification() {
  // Charger les données de gamification
  const savedGamification = localStorage.getItem("ecoTrackerGamification")
  if (savedGamification) {
    gamificationData = { ...gamificationData, ...JSON.parse(savedGamification) }
  }

  // Initialiser les animations
  initializeAnimations()

  // Mettre à jour l'arbre de croissance
  updateEcoTree()

  // Initialiser les défis
  initializeChallenges()
}

function initializeAnimations() {
  // Animation du score en cercle
  const scoreRing = document.querySelector(".progress-ring-circle")
  if (scoreRing) {
    const score = appState.stats.ecoScore
    const circumference = 2 * Math.PI * 26
    const offset = circumference - (score / 100) * circumference
    scoreRing.style.strokeDashoffset = offset
  }

  // Animation des particules
  createFloatingParticles()

  // Animation du titre
  animateTitle()
}

function createFloatingParticles() {
  const particleContainers = document.querySelectorAll(".floating-particles")

  particleContainers.forEach((container) => {
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement("div")
      particle.className = "particle"
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: #ff6b6b;
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: particleFloat ${3 + Math.random() * 2}s ease-in-out infinite;
        animation-delay: ${Math.random() * 2}s;
      `
      container.appendChild(particle)
    }
  })
}

function animateTitle() {
  const titleParts = document.querySelectorAll(".title-part")
  titleParts.forEach((part, index) => {
    setTimeout(() => {
      part.style.opacity = "1"
      part.style.transform = "translateY(0)"
    }, index * 200)
  })
}

function updateEcoTree() {
  const level = calculateUserLevel()
  const leaves = document.querySelectorAll(".leaf")

  // Animer les feuilles selon le niveau
  leaves.forEach((leaf, index) => {
    if (index < level) {
      leaf.style.opacity = "1"
      leaf.style.transform = "scale(1)"
    } else {
      leaf.style.opacity = "0.3"
      leaf.style.transform = "scale(0.8)"
    }
  })

  // Mettre à jour l'indicateur de croissance
  const growthIndicator = document.querySelector(".growth-indicator span")
  if (growthIndicator) {
    const levels = ["Graine 🌰", "Jeune Pousse 🌱", "Arbuste 🌿", "Jeune Arbre 🌳", "Arbre Mature 🌲"]
    growthIndicator.textContent = `Niveau: ${levels[Math.min(level - 1, levels.length - 1)]}`
  }
}

function calculateUserLevel() {
  const totalActivities = appState.activities.length
  const ecoScore = appState.stats.ecoScore

  // Calcul simple du niveau basé sur les activités et le score
  const level = Math.floor((totalActivities + ecoScore) / 20) + 1
  return Math.min(level, 5) // Maximum 5 niveaux
}

function initializeChallenges() {
  const challenges = [
    {
      id: "bike_week",
      title: "Semaine du Vélo",
      description: "Parcourez 50km à vélo cette semaine",
      target: 50,
      current: 0,
      reward: 500,
      icon: "🚴‍♂️",
      active: true,
    },
    {
      id: "energy_save",
      title: "Économie d'Énergie",
      description: "Réduisez votre consommation de 20%",
      target: 20,
      current: 0,
      reward: 300,
      icon: "💡",
      active: false,
    },
  ]

  gamificationData.challenges = challenges
  updateChallengesDisplay()
}

function updateChallengesDisplay() {
  const challengesGrid = document.querySelector(".challenges-grid")
  if (!challengesGrid) return

  challengesGrid.innerHTML = gamificationData.challenges
    .map(
      (challenge) => `
    <div class="challenge-card ${challenge.active ? "active" : ""}">
      <div class="challenge-icon">${challenge.icon}</div>
      <h4>${challenge.title}</h4>
      <p>${challenge.description}</p>
      <div class="challenge-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${(challenge.current / challenge.target) * 100}%"></div>
        </div>
        <span>${challenge.current}/${challenge.target} ${challenge.id === "bike_week" ? "km" : "%"}</span>
      </div>
      <div class="challenge-reward">
        <i class="fas fa-trophy"></i>
        <span>+${challenge.reward} pts</span>
      </div>
    </div>
  `,
    )
    .join("")
}

function checkAchievements(activity) {
  const newAchievements = []

  // Vérifier les différents types d'achievements
  if (activity.type === "transport" && activity.value > 10) {
    if (!gamificationData.achievements.includes("cyclist")) {
      newAchievements.push({
        id: "cyclist",
        title: "Cycliste Urbain",
        icon: "bicycle",
        description: "Premier trajet écologique enregistré",
      })
    }
  }

  if (activity.type === "electricity" && activity.carbonFootprint < 5) {
    if (!gamificationData.achievements.includes("energy_saver")) {
      newAchievements.push({
        id: "energy_saver",
        title: "Économe d'Énergie",
        icon: "lightbulb",
        description: "Consommation électrique optimisée",
      })
    }
  }

  // Ajouter les nouveaux achievements
  newAchievements.forEach((achievement) => {
    gamificationData.achievements.push(achievement.id)
    showAchievementNotification(achievement)
  })

  // Sauvegarder
  localStorage.setItem("ecoTrackerGamification", JSON.stringify(gamificationData))
}

function showAchievementNotification(achievement) {
  const notification = document.createElement("div")
  notification.className = "achievement-notification"
  notification.innerHTML = `
    <div class="achievement-content">
      <i class="fas fa-trophy"></i>
      <div>
        <h4>Nouvel Exploit Débloqué!</h4>
        <p>${achievement.title}</p>
      </div>
    </div>
  `

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #1dd1a1, #48dbfb);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(29, 209, 161, 0.3);
    z-index: 1001;
    animation: slideInRight 0.5s ease, pulse 0.5s ease 2s;
    max-width: 300px;
  `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.5s ease"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 500)
  }, 4000)
}

function setupEventListeners() {
  // Navigation
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const page = link.dataset.page
      navigateToPage(page)
    })
  })

  // Activity form
  activityForm.addEventListener("submit", handleActivitySubmit)

  // Quick action buttons
  quickButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.type
      const description = button.dataset.desc
      fillQuickAction(type, description)
    })
  })

  // Settings
  const settingsInputs = document.querySelectorAll("#profile input")
  settingsInputs.forEach((input) => {
    input.addEventListener("change", saveSettings)
  })
}

// Modifier la fonction handleActivitySubmit existante
const originalHandleActivitySubmit = handleActivitySubmit

function handleActivitySubmit(e) {
  e.preventDefault()

  // Appeler la fonction originale
  originalHandleActivitySubmit.call(this, e)

  // Ajouter la logique de gamification
  const formData = new FormData(activityForm)
  const activity = {
    type: formData.get("activity-type") || document.getElementById("activity-type").value,
    value: Number.parseFloat(formData.get("activity-value") || document.getElementById("activity-value").value),
    carbonFootprint: calculateCarbonFootprint({
      type: formData.get("activity-type") || document.getElementById("activity-type").value,
      value: Number.parseFloat(formData.get("activity-value") || document.getElementById("activity-value").value),
    }),
  }

  // Vérifier les achievements
  checkAchievements(activity)

  // Mettre à jour l'arbre
  updateEcoTree()

  // Mettre à jour les défis
  updateChallengeProgress(activity)
}

function updateChallengeProgress(activity) {
  gamificationData.challenges.forEach((challenge) => {
    if (challenge.id === "bike_week" && activity.type === "transport") {
      challenge.current = Math.min(challenge.current + activity.value, challenge.target)
    }

    if (challenge.id === "energy_save" && activity.type === "electricity") {
      // Logique pour calculer la réduction d'énergie
      const reduction = Math.max(0, 100 - activity.value) / 5 // Exemple simplifié
      challenge.current = Math.min(challenge.current + reduction, challenge.target)
    }
  })

  updateChallengesDisplay()
  localStorage.setItem("ecoTrackerGamification", JSON.stringify(gamificationData))
}

function navigateToPage(pageId) {
  // Update navigation
  navLinks.forEach((link) => link.classList.remove("active"))
  document.querySelector(`[data-page="${pageId}"]`).classList.add("active")

  // Update pages
  pages.forEach((page) => page.classList.remove("active"))
  document.getElementById(pageId).classList.add("active")

  appState.currentPage = pageId

  // Load page-specific data
  switch (pageId) {
    case "dashboard":
      updateDashboard()
      break
    case "solutions":
      loadRecommendations()
      break
    case "profile":
      loadProfile()
      break
  }
}

// Mock saveToHedera function
function saveToHedera(activity) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Activity saved to Hedera (simulated):", activity)
      resolve()
    }, 1000)
  })
}

function calculateCarbonFootprint(activity) {
  let carbon = 0

  switch (activity.type) {
    case "transport":
      carbon = activity.value * EMISSION_FACTORS.transport.car // Default to car
      break
    case "electricity":
      carbon = activity.value * EMISSION_FACTORS.electricity
      break
    case "heating":
      carbon = activity.value * EMISSION_FACTORS.heating.gas // Default to gas
      break
    case "water":
      carbon = activity.value * EMISSION_FACTORS.water
      break
    case "waste":
      carbon = activity.value * EMISSION_FACTORS.waste
      break
  }

  return Math.round(carbon * 100) / 100 // Round to 2 decimals
}

function updateStats() {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyActivities = appState.activities.filter((activity) => {
    const activityDate = new Date(activity.date)
    return activityDate.getMonth() === currentMonth && activityDate.getFullYear() === currentYear
  })

  appState.stats.totalCarbon = monthlyActivities.reduce((sum, activity) => sum + (activity.carbonFootprint || 0), 0)

  appState.stats.totalEnergy = monthlyActivities
    .filter((activity) => activity.type === "electricity" || activity.type === "heating")
    .reduce((sum, activity) => sum + activity.value, 0)

  // Calculate savings (simplified)
  appState.stats.totalSavings = Math.round(appState.stats.totalCarbon * 0.05 * 100) / 100

  // Calculate eco score (simplified)
  const targetCarbon = appState.user.settings.monthlyGoal
  const carbonRatio = Math.max(0, 1 - appState.stats.totalCarbon / targetCarbon)
  appState.stats.ecoScore = Math.round(carbonRatio * 100)

  // Save to localStorage
  localStorage.setItem("ecoTrackerData", JSON.stringify(appState))
}

function updateDashboard() {
  // Update stat cards
  document.getElementById("total-carbon").textContent = `${appState.stats.totalCarbon} kg`
  document.getElementById("total-energy").textContent = `${Math.round(appState.stats.totalEnergy)} kWh`
  document.getElementById("total-savings").textContent = `${appState.stats.totalSavings} €`
  document.getElementById("eco-score").textContent = appState.stats.ecoScore

  // Update recent activities
  updateRecentActivities()

  // Update charts
  updateCharts()
}

function updateRecentActivities() {
  const activitiesList = document.getElementById("activities-list")
  const recentActivities = appState.activities.slice(0, 5)

  if (recentActivities.length === 0) {
    activitiesList.innerHTML =
      '<p class="text-center" style="color: #64748b; padding: 2rem;">Aucune activité enregistrée</p>'
    return
  }

  activitiesList.innerHTML = recentActivities
    .map(
      (activity) => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.description}</h4>
                <p>${formatDate(activity.date)} • ${activity.value} ${activity.unit}</p>
            </div>
            <div class="activity-value">
                ${activity.carbonFootprint} kg CO₂
            </div>
        </div>
    `,
    )
    .join("")
}

function getActivityIcon(type) {
  const icons = {
    transport: "car",
    electricity: "bolt",
    heating: "fire",
    water: "tint",
    waste: "trash",
  }
  return icons[type] || "leaf"
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  })
}

function fillQuickAction(type, description) {
  document.getElementById("activity-type").value = type
  document.getElementById("activity-description").value = description

  // Set default values based on type
  const defaults = {
    transport: { value: 10, unit: "km" },
    electricity: { value: 50, unit: "kwh" },
    heating: { value: 30, unit: "kwh" },
  }

  if (defaults[type]) {
    document.getElementById("activity-value").value = defaults[type].value
    document.getElementById("activity-unit").value = defaults[type].unit
  }
}

function loadRecommendations() {
  const recommendationsContainer = document.getElementById("recommendations")

  // Analyze user data to provide personalized recommendations
  const recommendations = generateRecommendations()

  recommendationsContainer.innerHTML = `
        <h3>Recommandations Personnalisées</h3>
        <div class="recommendations-list">
            ${recommendations
              .map(
                (rec) => `
                <div class="recommendation-item">
                    <div class="recommendation-icon">
                        <i class="fas fa-${rec.icon}"></i>
                    </div>
                    <div class="recommendation-content">
                        <h4>${rec.title}</h4>
                        <p>${rec.description}</p>
                        <div class="recommendation-impact">
                            <span class="impact-badge">${rec.impact}</span>
                        </div>
                    </div>
                </div>
            `,
              )
              .join("")}
        </div>
    `
}

function generateRecommendations() {
  const recommendations = []

  // Analyze transport activities
  const transportActivities = appState.activities.filter((a) => a.type === "transport")
  if (transportActivities.length > 0) {
    const avgTransport = transportActivities.reduce((sum, a) => sum + a.value, 0) / transportActivities.length
    if (avgTransport > 20) {
      recommendations.push({
        icon: "bicycle",
        title: "Privilégiez le vélo",
        description: "Vos trajets moyens de " + Math.round(avgTransport) + "km pourraient être effectués à vélo.",
        impact: "-60% CO₂",
      })
    }
  }

  // Analyze energy consumption
  const energyActivities = appState.activities.filter((a) => a.type === "electricity")
  if (energyActivities.length > 0) {
    recommendations.push({
      icon: "lightbulb",
      title: "Optimisez votre éclairage",
      description: "Remplacez vos ampoules par des LED pour réduire votre consommation.",
      impact: "-75% consommation",
    })
  }

  // Default recommendations if no data
  if (recommendations.length === 0) {
    recommendations.push(
      {
        icon: "leaf",
        title: "Commencez votre suivi",
        description: "Enregistrez vos premières activités pour recevoir des conseils personnalisés.",
        impact: "Démarrage",
      },
      {
        icon: "recycle",
        title: "Triez vos déchets",
        description: "Le tri sélectif peut réduire significativement votre impact environnemental.",
        impact: "-30% déchets",
      },
    )
  }

  return recommendations
}

function loadProfile() {
  // Load user settings
  document.getElementById("notifications").checked = appState.user.settings.notifications
  document.getElementById("daily-reminders").checked = appState.user.settings.dailyReminders
  document.getElementById("monthly-goal").value = appState.user.settings.monthlyGoal
}

function saveSettings() {
  appState.user.settings.notifications = document.getElementById("notifications").checked
  appState.user.settings.dailyReminders = document.getElementById("daily-reminders").checked
  appState.user.settings.monthlyGoal = Number.parseInt(document.getElementById("monthly-goal").value)

  localStorage.setItem("ecoTrackerData", JSON.stringify(appState))
  showNotification("Paramètres sauvegardés", "success")
}

function loadSampleData() {
  // Load sample data if no activities exist
  if (appState.activities.length === 0) {
    const sampleActivities = [
      {
        id: 1,
        type: "transport",
        description: "Trajet domicile-travail",
        value: 25,
        unit: "km",
        date: "2024-01-20",
        carbonFootprint: 5.25,
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        type: "electricity",
        description: "Consommation électrique",
        value: 120,
        unit: "kwh",
        date: "2024-01-19",
        carbonFootprint: 60,
        timestamp: new Date().toISOString(),
      },
      {
        id: 3,
        type: "heating",
        description: "Chauffage gaz",
        value: 80,
        unit: "kwh",
        date: "2024-01-18",
        carbonFootprint: 14.4,
        timestamp: new Date().toISOString(),
      },
    ]

    appState.activities = sampleActivities
    updateStats()
  }
}

// Mock updateCharts function
function updateCharts() {
  console.log("Charts updated (simulated)")
}

// Utility functions
function showLoading() {
  loadingOverlay.classList.add("active")
}

function hideLoading() {
  loadingOverlay.classList.remove("active")
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : "info-circle"}"></i>
        <span>${message}</span>
    `

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#1dd1a1" : "#667eea"};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `

  document.body.appendChild(notification)

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// Add CSS for notifications
const notificationStyles = document.createElement("style")
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`
document.head.appendChild(notificationStyles)

// Ajouter les styles d'animation manquants
const additionalStyles = document.createElement("style")
additionalStyles.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .achievement-notification {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .achievement-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .achievement-content i {
    font-size: 2rem;
    color: #ffd700;
  }
  
  .achievement-content h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
  
  .achievement-content p {
    margin: 0;
    font-size: 0.875rem;
    opacity: 0.9;
  }
`
document.head.appendChild(additionalStyles)

// Initialiser la gamification au chargement
document.addEventListener("DOMContentLoaded", () => {
  // Attendre que l'app soit initialisée
  setTimeout(initializeGamification, 500)
})

// Export for use in other modules
window.EcoTracker = {
  appState,
  navigateToPage,
  showNotification,
  updateDashboard,
}
// Application State
appState = {
  currentPage: 'dashboard',
  calculations: {
    datacenter: null,
    cloud: null,
    development: null,
    network: null
  },
  totals: {
    energy: 0,
    carbon: 0,
    cost: 0,
    efficiency: 0
  },
  settings: {
    energyPrice: 0.15, // €/kWh
    carbonFactor: 0.5, // kg CO2/kWh
    currency: 'EUR'
  }
};

// Energy and Carbon Factors
const FACTORS = {
  datacenter: {
    server: {
      rack: { power: 400, efficiency: 0.85 },
      blade: { power: 300, efficiency: 0.90 },
      tower: { power: 500, efficiency: 0.80 },
      hpc: { power: 1500, efficiency: 0.75 }
    },
    cooling: {
      air: 1.5,
      liquid: 1.3,
      immersion: 1.1,
      free: 1.2
    }
  },
  cloud: {
    instances: {
      't3.micro': { power: 2.5, carbon: 0.001 },
      't3.small': { power: 5, carbon: 0.002 },
      'm5.large': { power: 15, carbon: 0.007 },
      'c5.xlarge': { power: 25, carbon: 0.012 },
      'r5.2xlarge': { power: 45, carbon: 0.022 }
    },
    storage: {
      ssd: { power: 0.0065, carbon: 0.000003 }, // per GB
      hdd: { power: 0.004, carbon: 0.000002 },
      archive: { power: 0.0012, carbon: 0.0000006 }
    },
    transfer: {
      power: 0.006, // per GB
      carbon: 0.000003
    }
  },
  development: {
    workstations: {
      laptop: 65,
      desktop: 150,
      workstation: 300,
      mac: 100
    },
    cicd: {
      buildPower: 200, // W during build
      testPower: 150   // W during test
    }
  },
  network: {
    equipment: {
      wifi: 15,
      switch24: 45,
      switch48: 85,
      routerAccess: 120,
      routerCore: 350,
      firewall: 180,
      loadbalancer: 200
    }
  },
  carbon: {
    grid: 0.5,      // kg CO2/kWh - standard grid
    renewable: 0.05, // kg CO2/kWh - renewable
    mixed: 0.3,     // kg CO2/kWh - mixed
    coal: 0.9       // kg CO2/kWh - coal
  }
};

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
let loadingOverlayGreenIT = document.getElementById('loading-overlay');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initializeAppGreenIT();
  setupEventListenersGreenIT();
  updateDashboardGreenIT();
});

function initializeAppGreenIT() {
  console.log('Green IT Application initialized');
  
  // Load saved data
  const savedData = localStorage.getItem('greenITData');
  if (savedData) {
    appState = { ...appState, ...JSON.parse(savedData) };
  }
  
  // Initialize charts
  initializeCharts();
  
  // Update range value displays
  updateRangeValues();
}

function setupEventListenersGreenIT() {
  // Navigation
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      navigateToPageGreenIT(page);
    });
  });
  
  // Calculator buttons
  setupCalculatorListeners();
  
  // Range inputs
  setupRangeListeners();
  
  // Form submissions
  setupFormListeners();
}

function navigateToPageGreenIT(pageId) {
  // Update navigation
  navItems.forEach(item => item.classList.remove('active'));
  document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
  
  // Update pages
  pages.forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  
  appState.currentPage = pageId;
  
  // Page-specific initialization
  switch(pageId) {
    case 'dashboard':
      updateDashboardGreenIT();
      break;
    case 'recommendations':
      loadRecommendationsGreenIT();
      break;
    case 'blockchain':
      loadBlockchainData();
      break;
  }
}

function setupCalculatorListeners() {
  // Data Center Calculator
  const dcCalculateBtn = document.getElementById('calculate-datacenter');
  const dcResetBtn = document.getElementById('reset-datacenter');
  
  if (dcCalculateBtn) {
    dcCalculateBtn.addEventListener('click', calculateDataCenter);
  }
  
  if (dcResetBtn) {
    dcResetBtn.addEventListener('click', resetDataCenterForm);
  }
  
  // Cloud Calculator
  const cloudCalculateBtn = document.getElementById('calculate-cloud');
  const cloudResetBtn = document.getElementById('reset-cloud');
  
  if (cloudCalculateBtn) {
    cloudCalculateBtn.addEventListener('click', calculateCloud);
  }
  
  if (cloudResetBtn) {
    cloudResetBtn.addEventListener('click', resetCloudForm);
  }
  
  // Development Calculator
  const devCalculateBtn = document.getElementById('calculate-development');
  const devResetBtn = document.getElementById('reset-development');
  
  if (devCalculateBtn) {
    devCalculateBtn.addEventListener('click', calculateDevelopment);
  }
  
  if (devResetBtn) {
    devResetBtn.addEventListener('click', resetDevelopmentForm);
  }
  
  // Network Calculator
  const networkCalculateBtn = document.getElementById('calculate-network');
  const networkResetBtn = document.getElementById('reset-network');
  
  if (networkCalculateBtn) {
    networkCalculateBtn.addEventListener('click', calculateNetwork);
  }
  
  if (networkResetBtn) {
    networkResetBtn.addEventListener('click', resetNetworkForm);
  }
}

function setupRangeListeners() {
  const rangeInputs = document.querySelectorAll('input[type="range"]');
  rangeInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const valueSpan = e.target.nextElementSibling;
      if (valueSpan && valueSpan.classList.contains('range-value')) {
        valueSpan.textContent = e.target.value + '%';
      }
    });
  });
}

function updateRangeValues() {
  const rangeInputs = document.querySelectorAll('input[type="range"]');
  rangeInputs.forEach(input => {
    const valueSpan = input.nextElementSibling;
    if (valueSpan && valueSpan.classList.contains('range-value')) {
      valueSpan.textContent = input.value + '%';
    }
  });
}

// Data Center Calculator
function calculateDataCenter() {
  showLoadingGreenIT();
  
  setTimeout(() => {
    const serverCount = parseInt(document.getElementById('server-count').value) || 0;
    const serverType = document.getElementById('server-type').value;
    const cpuUsage = parseInt(document.getElementById('cpu-usage').value) || 0;
    const powerRating = parseInt(document.getElementById('power-rating').value) || 0;
    const coolingType = document.getElementById('cooling-type').value;
    const pue = parseFloat(document.getElementById('pue').value) || 1.5;
    const uptime = parseInt(document.getElementById('uptime').value) || 24;
    const energySource = document.getElementById('energy-source').value;
    
    // Calculate base power consumption
    const serverPower = powerRating * (cpuUsage / 100);
    const totalServerPower = serverCount * serverPower;
    
    // Apply PUE for infrastructure overhead
    const totalPower = totalServerPower * pue;
    
    // Calculate monthly consumption
    const monthlyEnergy = (totalPower * uptime * 30) / 1000; // kWh
    
    // Calculate carbon emissions based on energy source
    const carbonFactor = FACTORS.carbon[energySource] || FACTORS.carbon.grid;
    const monthlyCarbon = monthlyEnergy * carbonFactor;
    
    // Calculate cost
    const monthlyCost = monthlyEnergy * appState.settings.energyPrice;
    
    // Update results
    document.getElementById('dc-energy').textContent = Math.round(monthlyEnergy);
    document.getElementById('dc-carbon').textContent = Math.round(monthlyCarbon);
    document.getElementById('dc-cost').textContent = Math.round(monthlyCost);
    
    // Store calculation
    appState.calculations.datacenter = {
      energy: monthlyEnergy,
      carbon: monthlyCarbon,
      cost: monthlyCost,
      timestamp: new Date().toISOString()
    };
    
    // Generate suggestions
    generateDataCenterSuggestions();
    
    // Update status
    document.getElementById('calculation-status').innerHTML = `
      <i class="fas fa-check-circle"></i>
      Calcul terminé
    `;
    
    // Save to Hedera
    saveCalculationToHedera('datacenter', appState.calculations.datacenter);
    
    hideLoadingGreenIT();
    updateTotals();
    saveAppState();
  }, 1500);
}

function generateDataCenterSuggestions() {
  const suggestions = [];
  const calculation = appState.calculations.datacenter;
  
  if (!calculation) return;
  
  const pue = parseFloat(document.getElementById('pue').value) || 1.5;
  const coolingType = document.getElementById('cooling-type').value;
  
  if (pue > 1.4) {
    suggestions.push({
      title: 'Optimiser le PUE',
      description: `Votre PUE de ${pue} peut être amélioré. Objectif: < 1.3`,
      impact: `Économie potentielle: ${Math.round(calculation.energy * 0.15)} kWh/mois`,
      priority: 'high'
    });
  }
  
  if (coolingType === 'air') {
    suggestions.push({
      title: 'Refroidissement Liquide',
      description: 'Le refroidissement liquide peut réduire la consommation de 20%',
      impact: `Économie: ${Math.round(calculation.energy * 0.2)} kWh/mois`,
      priority: 'medium'
    });
  }
  
  const energySource = document.getElementById('energy-source').value;
  if (energySource !== 'renewable') {
    suggestions.push({
      title: 'Énergie Renouvelable',
      description: 'Migrer vers une source d\'énergie 100% renouvelable',
      impact: `Réduction: ${Math.round(calculation.carbon * 0.9)} kg CO₂/mois`,
      priority: 'high'
    });
  }
  
  displaySuggestions('dc-suggestions', suggestions);
}

function displaySuggestions(containerId, suggestions) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (suggestions.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-500">Aucune suggestion disponible</p>';
    return;
  }
  
  container.innerHTML = `
    <h4 class="font-semibold text-gray-800 mb-4">Suggestions d'Optimisation</h4>
    <div class="space-y-3">
      ${suggestions.map(suggestion => `
        <div class="suggestion-item p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h5 class="font-semibold text-gray-800">${suggestion.title}</h5>
              <p class="text-sm text-gray-600 mt-1">${suggestion.description}</p>
              <p class="text-sm font-medium text-green-600 mt-2">${suggestion.impact}</p>
            </div>
            <span class="priority-badge priority-${suggestion.priority} ml-3">
              ${suggestion.priority === 'high' ? 'Priorité Haute' : 
                suggestion.priority === 'medium' ? 'Priorité Moyenne' : 'Priorité Basse'}
            </span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Cloud Calculator
function calculateCloud() {
  showLoadingGreenIT();
  
  setTimeout(() => {
    const computeType = document.getElementById('compute-type').value;
    const computeCount = parseInt(document.getElementById('compute-count').value) || 0;
    const computeUsage = parseInt(document.getElementById('compute-usage').value) || 0;
    const storageType = document.getElementById('storage-type').value;
    const storageSize = parseInt(document.getElementById('storage-size').value) || 0;
    const dataTransfer = parseInt(document.getElementById('data-transfer').value) || 0;
    
    // Calculate compute energy
    const instancePower = FACTORS.cloud.instances[computeType]?.power || 0;
    const computeEnergy = instancePower * computeCount * (computeUsage / 100) * 24 * 30 / 1000; // kWh/month
    
    // Calculate storage energy
    const storagePower = FACTORS.cloud.storage[storageType]?.power || 0;
    const storageEnergy = storagePower * storageSize * 24 * 30 / 1000; // kWh/month
    
    // Calculate transfer energy
    const transferEnergy = FACTORS.cloud.transfer.power * dataTransfer / 1000; // kWh/month
    
    // Total energy
    const totalEnergy = computeEnergy + storageEnergy + transferEnergy;
    
    // Calculate carbon (cloud providers typically have better efficiency)
    const totalCarbon = totalEnergy * 0.3; // Assuming cloud providers use mixed energy
    
    // Calculate cost (simplified)
    const totalCost = totalEnergy * appState.settings.energyPrice * 1.2; // Cloud markup
    
    // Update results
    document.getElementById('cloud-energy').textContent = Math.round(totalEnergy);
    document.getElementById('cloud-carbon').textContent = Math.round(totalCarbon);
    document.getElementById('cloud-cost').textContent = Math.round(totalCost);
    
    // Store calculation
    appState.calculations.cloud = {
      energy: totalEnergy,
      carbon: totalCarbon,
      cost: totalCost,
      timestamp: new Date().toISOString()
    };
    
    hideLoadingGreenIT();
    updateTotals();
    saveAppState();
  }, 1200);
}

// Development Calculator
function calculateDevelopment() {
  showLoadingGreenIT();
  
  setTimeout(() => {
    const devCount = parseInt(document.getElementById('dev-count').value) || 0;
    const workHours = parseInt(document.getElementById('work-hours').value) || 8;
    const workstationType = document.getElementById('workstation-type').value;
    const buildsPerDay = parseInt(document.getElementById('builds-per-day').value) || 0;
    const buildDuration = parseInt(document.getElementById('build-duration').value) || 0;
    const testsPerDay = parseInt(document.getElementById('tests-per-day').value) || 0;
    const testDuration = parseInt(document.getElementById('test-duration').value) || 0;
    
    // Calculate workstation energy
    const workstationPower = FACTORS.development.workstations[workstationType] || 0;
    const workstationEnergy = devCount * workstationPower * workHours * 22 / 1000; // kWh/month (22 working days)
    
    // Calculate CI/CD energy
    const buildEnergy = buildsPerDay * buildDuration * FACTORS.development.cicd.buildPower * 22 / 60 / 1000; // kWh/month
    const testEnergy = testsPerDay * testDuration * FACTORS.development.cicd.testPower * 22 / 60 / 1000; // kWh/month
    
    // Total energy
    const totalEnergy = workstationEnergy + buildEnergy + testEnergy;
    
    // Calculate carbon
    const totalCarbon = totalEnergy * FACTORS.carbon.grid;
    
    // Calculate efficiency score (builds + tests per kWh)
    const efficiency = totalEnergy > 0 ? Math.round(((buildsPerDay + testsPerDay) * 22) / totalEnergy) : 0;
    
    // Update results
    document.getElementById('dev-energy').textContent = Math.round(totalEnergy);
    document.getElementById('dev-carbon').textContent = Math.round(totalCarbon);
    document.getElementById('dev-efficiency').textContent = efficiency;
    
    // Store calculation
    appState.calculations.development = {
      energy: totalEnergy,
      carbon: totalCarbon,
      efficiency: efficiency,
      timestamp: new Date().toISOString()
    };
    
    // Generate development recommendations
    generateDevelopmentRecommendations();
    
    hideLoadingGreenIT();
    updateTotals();
    saveAppState();
  }, 1000);
}

function generateDevelopmentRecommendations() {
  const recommendations = [];
  const buildsPerDay = parseInt(document.getElementById('builds-per-day').value) || 0;
  const testsPerDay = parseInt(document.getElementById('tests-per-day').value) || 0;
  
  if (buildsPerDay > 30) {
    recommendations.push({
      title: 'Optimiser les Builds',
      description: 'Trop de builds par jour. Considérez la mise en cache et l\'optimisation.',
      impact: 'Réduction potentielle: 30% de l\'énergie CI/CD'
    });
  }
  
  if (testsPerDay > 50) {
    recommendations.push({
      title: 'Tests Parallèles',
      description: 'Exécuter les tests en parallèle pour réduire le temps total.',
      impact: 'Gain de temps: 40-60%'
    });
  }
  
  recommendations.push({
    title: 'Green Coding',
    description: 'Adopter des pratiques de développement éco-responsable.',
    impact: 'Réduction globale: 15-25%'
  });
  
  displayRecommendations('dev-recommendations', recommendations);
}

function displayRecommendations(containerId, recommendations) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <h4 class="font-semibold text-gray-800 mb-4">Recommandations</h4>
    <div class="space-y-3">
      ${recommendations.map(rec => `
        <div class="recommendation-item p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h5 class="font-medium text-blue-800">${rec.title}</h5>
          <p class="text-sm text-blue-600 mt-1">${rec.description}</p>
          <p class="text-sm font-medium text-green-600 mt-2">${rec.impact}</p>
        </div>
      `).join('')}
    </div>
  `;
}

// Network Calculator
function calculateNetwork() {
  showLoadingGreenIT();
  
  setTimeout(() => {
    const wifiCount = parseInt(document.getElementById('wifi-count').value) || 0;
    const switch24Count = parseInt(document.getElementById('switch-24-count').value) || 0;
    const switch48Count = parseInt(document.getElementById('switch-48-count').value) || 0;
    const routerAccessCount = parseInt(document.getElementById('router-access-count').value) || 0;
    const routerCoreCount = parseInt(document.getElementById('router-core-count').value) || 0;
    const firewallCount = parseInt(document.getElementById('firewall-count').value) || 0;
    const loadbalancerCount = parseInt(document.getElementById('loadbalancer-count').value) || 0;
    const utilization = parseInt(document.getElementById('network-utilization').value) || 0;
    const peakHours = parseInt(document.getElementById('peak-hours').value) || 8;
    
    // Calculate total power consumption
    const totalPower = 
      wifiCount * FACTORS.network.equipment.wifi +
      switch24Count * FACTORS.network.equipment.switch24 +
      switch48Count * FACTORS.network.equipment.switch48 +
      routerAccessCount * FACTORS.network.equipment.routerAccess +
      routerCoreCount * FACTORS.network.equipment.routerCore +
      firewallCount * FACTORS.network.equipment.firewall +
      loadbalancerCount * FACTORS.network.equipment.loadbalancer;
    
    // Apply utilization factor
    const adjustedPower = totalPower * (0.3 + (utilization / 100) * 0.7); // Base 30% + variable based on utilization
    
    // Calculate monthly energy
    const monthlyEnergy = adjustedPower * 24 * 30 / 1000; // kWh/month
    
    // Calculate carbon
    const monthlyCarbon = monthlyEnergy * FACTORS.carbon.grid;
    
    // Calculate efficiency (Mbps per Watt - simplified)
    const estimatedThroughput = (switch24Count * 24 + switch48Count * 48) * 100; // Mbps
    const efficiency = totalPower > 0 ? Math.round(estimatedThroughput / totalPower * 100) / 100 : 0;
    
    // Update results
    document.getElementById('network-energy').textContent = Math.round(monthlyEnergy);
    document.getElementById('network-carbon').textContent = Math.round(monthlyCarbon);
    document.getElementById('network-efficiency').textContent = efficiency;
    
    // Store calculation
    appState.calculations.network = {
      energy: monthlyEnergy,
      carbon: monthlyCarbon,
      efficiency: efficiency,
      timestamp: new Date().toISOString()
    };
    
    hideLoadingGreenIT();
    updateTotals();
    saveAppState();
  }, 800);
}

// Reset Functions
function resetDataCenterForm() {
  document.getElementById('server-count').value = 10;
  document.getElementById('server-type').value = 'rack';
  document.getElementById('cpu-usage').value = 70;
  document.getElementById('power-rating').value = 400;
  document.getElementById('cooling-type').value = 'air';
  document.getElementById('pue').value = 1.5;
  document.getElementById('uptime').value = 24;
  document.getElementById('energy-source').value = 'grid';
  updateRangeValues();
}

function resetCloudForm() {
  document.getElementById('compute-type').value = 't3.micro';
  document.getElementById('compute-count').value = 5;
  document.getElementById('compute-usage').value = 60;
  document.getElementById('storage-type').value = 'ssd';
  document.getElementById('storage-size').value = 1000;
  document.getElementById('data-transfer').value = 500;
  updateRangeValues();
}

function resetDevelopmentForm() {
  document.getElementById('dev-count').value = 10;
  document.getElementById('work-hours').value = 8;
  document.getElementById('workstation-type').value = 'laptop';
  document.getElementById('builds-per-day').value = 20;
  document.getElementById('build-duration').value = 15;
  document.getElementById('tests-per-day').value = 50;
  document.getElementById('test-duration').value = 10;
}

function resetNetworkForm() {
  document.getElementById('wifi-count').value = 50;
  document.getElementById('switch-24-count').value = 10;
  document.getElementById('switch-48-count').value = 5;
  document.getElementById('router-access-count').value = 3;
  document.getElementById('router-core-count').value = 2;
  document.getElementById('firewall-count').value = 2;
  document.getElementById('loadbalancer-count').value = 2;
  document.getElementById('network-utilization').value = 40;
  document.getElementById('peak-hours').value = 8;
  updateRangeValues();
}

// Dashboard Functions
function updateDashboardGreenIT() {
  updateTotals();
  updateKPICards();
  updateInfrastructureMap();
}

function updateTotals() {
  let totalEnergy = 0;
  let totalCarbon = 0;
  let totalCost = 0;
  let avgEfficiency = 0;
  let efficiencyCount = 0;
  
  Object.values(appState.calculations).forEach(calc => {
    if (calc) {
      totalEnergy += calc.energy || 0;
      totalCarbon += calc.carbon || 0;
      totalCost += calc.cost || 0;
      if (calc.efficiency) {
        avgEfficiency += calc.efficiency;
        efficiencyCount++;
      }
    }
  });
  
  appState.totals = {
    energy: totalEnergy,
    carbon: totalCarbon,
    cost: totalCost,
    efficiency: efficiencyCount > 0 ? Math.round(avgEfficiency / efficiencyCount) : 0
  };
  
  // Update sidebar counter
  const totalSavedElement = document.getElementById('total-saved');
  if (totalSavedElement) {
    totalSavedElement.textContent = `${(totalCarbon / 1000).toFixed(1)}t`;
  }
}

function updateKPICards() {
  const { energy, carbon, cost, efficiency } = appState.totals;
  
  // Update KPI values
  const totalEnergyEl = document.getElementById('total-energy');
  const totalCarbonEl = document.getElementById('total-carbon');
  const totalCostEl = document.getElementById('total-cost');
  const efficiencyScoreEl = document.getElementById('efficiency-score');
  
  if (totalEnergyEl) totalEnergyEl.textContent = Math.round(energy);
  if (totalCarbonEl) totalCarbonEl.textContent = Math.round(carbon);
  if (totalCostEl) totalCostEl.textContent = Math.round(cost);
  if (efficiencyScoreEl) efficiencyScoreEl.textContent = efficiency;
}

function updateInfrastructureMap() {
  // Update infrastructure node status based on calculations
  const nodes = document.querySelectorAll('.infrastructure-node');
  
  nodes.forEach(node => {
    const nodeType = node.classList.contains('datacenter') ? 'datacenter' :
                    node.classList.contains('cloud') ? 'cloud' : 'network';
    
    const calculation = appState.calculations[nodeType];
    if (calculation) {
      node.classList.add('active');
      const statusIndicator = node.querySelector('.status-indicator');
      const statusText = node.querySelector('.node-status span');
      
      if (statusIndicator && statusText) {
        const utilization = Math.min(100, Math.round((calculation.energy / 1000) * 10));
        statusText.textContent = `${utilization}% utilisation`;
        
        statusIndicator.className = 'status-indicator';
        if (utilization > 70) statusIndicator.classList.add('high');
        else if (utilization > 40) statusIndicator.classList.add('medium');
        else statusIndicator.classList.add('low');
      }
    }
  });
}

// Recommendations
function loadRecommendationsGreenIT() {
  const recommendationsContainer = document.getElementById('recommendations-list');
  if (!recommendationsContainer) return;
  
  const recommendations = generateAllRecommendations();
  
  recommendationsContainer.innerHTML = recommendations.map(rec => `
    <div class="recommendation-card p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white">
            <i class="fas fa-${rec.icon}"></i>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800">${rec.title}</h3>
            <span class="text-sm text-gray-500">${rec.category}</span>
          </div>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-medium ${rec.impact === 'high' ? 'bg-red-100 text-red-800' : 
          rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
          ${rec.impact === 'high' ? 'Impact Élevé' : rec.impact === 'medium' ? 'Impact Moyen' : 'Impact Faible'}
        </span>
      </div>
      <p class="text-gray-600 mb-4">${rec.description}</p>
      <div class="flex items-center justify-between">
        <div class="text-sm">
          <span class="font-medium text-green-600">${rec.savings}</span>
          <span class="text-gray-500">d'économie potentielle</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <i class="fas fa-clock"></i>
          <span>${rec.complexity === 'easy' ?  'Facile' : rec.complexity === 'medium' ? 'Moyen' : 'Difficile'}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function generateAllRecommendations() {
  return [
    {
      title: 'Migration vers le Cloud Vert',
      category: 'Infrastructure',
      description: 'Migrez vos workloads vers des fournisseurs cloud utilisant 100% d\'énergie renouvelable.',
      impact: 'high',
      savings: '60-80% CO₂',
      complexity: 'medium',
      icon: 'cloud'
    },
    {
      title: 'Optimisation des Serveurs',
      category: 'Data Center',
      description: 'Consolidez vos serveurs et utilisez la virtualisation pour améliorer l\'efficacité.',
      impact: 'high',
      savings: '30-50% énergie',
      complexity: 'medium',
      icon: 'server'
    },
    {
      title: 'Refroidissement Liquide',
      category: 'Data Center',
      description: 'Remplacez le refroidissement par air par un système de refroidissement liquide.',
      impact: 'medium',
      savings: '20-30% énergie',
      complexity: 'hard',
      icon: 'snowflake'
    },
    {
      title: 'Green Coding',
      category: 'Développement',
      description: 'Adoptez des pratiques de développement éco-responsable et optimisez votre code.',
      impact: 'medium',
      savings: '15-25% énergie',
      complexity: 'easy',
      icon: 'code'
    },
    {
      title: 'Monitoring Énergétique',
      category: 'Monitoring',
      description: 'Implémentez un système de monitoring en temps réel de la consommation énergétique.',
      impact: 'low',
      savings: '10-15% énergie',
      complexity: 'easy',
      icon: 'chart-line'
    },
    {
      title: 'Équipements Réseau Efficaces',
      category: 'Réseau',
      description: 'Remplacez les équipements réseau anciens par des modèles plus efficaces énergétiquement.',
      impact: 'medium',
      savings: '25-40% énergie réseau',
      complexity: 'medium',
      icon: 'network-wired'
    }
  ];
}

// Blockchain Integration
function loadBlockchainData() {
  // Simulate blockchain data loading
  setTimeout(() => {
    document.getElementById('blockchain-transactions').textContent = '1,247';
    document.getElementById('blockchain-verified').textContent = '856';
    document.getElementById('blockchain-certificates').textContent = '23';
    
    loadTransactionsList();
  }, 500);
}

function loadTransactionsList() {
  const transactionsList = document.getElementById('transactions-list');
  if (!transactionsList) return;
  
  const transactions = [
    {
      id: '0.0.123456@1640995200.123456789',
      type: 'Data Center Calculation',
      timestamp: '2024-01-15 14:30:25',
      status: 'verified',
      hash: 'a1b2c3d4e5f6...'
    },
    {
      id: '0.0.123456@1640995100.987654321',
      type: 'Cloud Assessment',
      timestamp: '2024-01-15 14:28:15',
      status: 'verified',
      hash: 'f6e5d4c3b2a1...'
    },
    {
      id: '0.0.123456@1640995000.456789123',
      type: 'Network Analysis',
      timestamp: '2024-01-15 14:25:45',
      status: 'pending',
      hash: 'b2c3d4e5f6a1...'
    }
  ];
  
  transactionsList.innerHTML = transactions.map(tx => `
    <div class="transaction-item p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full ${tx.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'} flex items-center justify-center">
              <i class="fas fa-${tx.status === 'verified' ? 'check' : 'clock'} text-xs"></i>
            </div>
            <div>
              <h4 class="font-medium text-gray-800">${tx.type}</h4>
              <p class="text-sm text-gray-500">${tx.timestamp}</p>
            </div>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm font-mono text-gray-600">${tx.id}</p>
          <p class="text-xs text-gray-400">${tx.hash}</p>
        </div>
      </div>
    </div>
  `).join('');
}

// Hedera Integration
async function saveCalculationToHedera(type, calculation) {
  try {
    // Simulate Hedera transaction
    console.log(`Saving ${type} calculation to Hedera:`, calculation);
    
    // In a real implementation, this would use the Hedera SDK
    const transactionId = `0.0.123456@${Date.now()}.${Math.random().toString().substr(2, 9)}`;
    
    // Store transaction reference
    if (!appState.hederaTransactions) {
      appState.hederaTransactions = [];
    }
    
    appState.hederaTransactions.push({
      id: transactionId,
      type: type,
      data: calculation,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Transaction saved with ID: ${transactionId}`);
    
  } catch (error) {
    console.error('Error saving to Hedera:', error);
  }
}

// Charts Initialization
function initializeCharts() {
  // Initialize mini charts for KPI cards
  initializeKPICharts();
  
  // Initialize dashboard charts
  initializeDashboardCharts();
}

function initializeKPICharts() {
  const chartIds = ['energy-trend', 'carbon-trend', 'cost-trend', 'efficiency-trend'];
  
  chartIds.forEach(chartId => {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['J-6', 'J-5', 'J-4', 'J-3', 'J-2', 'J-1', 'Aujourd\'hui'],
        datasets: [{
          data: generateTrendData(),
          borderColor: '#1dd1a1',
          backgroundColor: 'rgba(29, 209, 161, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        },
        elements: {
          point: { radius: 0 }
        }
      }
    });
  });
}

function initializeDashboardCharts() {
  // Energy breakdown chart
  const energyCanvas = document.getElementById('energy-breakdown-chart');
  if (energyCanvas) {
    const ctx = energyCanvas.getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Data Center', 'Cloud', 'Réseau', 'Autres'],
        datasets: [{
          data: [45, 30, 15, 10],
          backgroundColor: [
            '#1dd1a1',
            '#667eea',
            '#feca57',
            '#94a3b8'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        cutout: '60%'
      }
    });
  }
}

function generateTrendData() {
  return Array.from({ length: 7 }, () => Math.floor(Math.random() * 100));
}

// Utility Functions
function showLoadingGreenIT() {
  loadingOverlayGreenIT.classList.add('active');
}

function hideLoadingGreenIT() {
  loadingOverlayGreenIT.classList.remove('active');
}

function saveAppState() {
  localStorage.setItem('greenITData', JSON.stringify(appState));
}

function setupFormListeners() {
  // Add any additional form listeners here
}

// Export for use in other modules
window.GreenIT = {
  appState,
  navigateToPageGreenIT,
  updateDashboardGreenIT,
  calculateDataCenter,
  calculateCloud,
  calculateDevelopment,
  calculateNetwork
};
