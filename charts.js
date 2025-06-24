import { Chart } from "@/components/ui/chart"
// Chart.js configuration and management
let monthlyChart = null
let categoryChart = null

function updateCharts() {
  updateMonthlyChart()
  updateCategoryChart()
}

function updateMonthlyChart() {
  const ctx = document.getElementById("monthlyChart")
  if (!ctx) return

  // Destroy existing chart
  if (monthlyChart) {
    monthlyChart.destroy()
  }

  // Generate monthly data for the last 6 months
  const monthlyData = generateMonthlyData()

  monthlyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: monthlyData.labels,
      datasets: [
        {
          label: "Émissions CO₂ (kg)",
          data: monthlyData.carbon,
          borderColor: "#ff6b6b",
          backgroundColor: "rgba(255, 107, 107, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#ff6b6b",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 6,
        },
        {
          label: "Consommation Énergie (kWh)",
          data: monthlyData.energy,
          borderColor: "#feca57",
          backgroundColor: "rgba(254, 202, 87, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#feca57",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              family: "Inter",
              size: 12,
              weight: "500",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "#667eea",
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          titleFont: {
            family: "Inter",
            size: 14,
            weight: "600",
          },
          bodyFont: {
            family: "Inter",
            size: 12,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              family: "Inter",
              size: 11,
            },
            color: "#64748b",
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(102, 126, 234, 0.1)",
            borderDash: [5, 5],
          },
          ticks: {
            font: {
              family: "Inter",
              size: 11,
            },
            color: "#64748b",
          },
        },
      },
      elements: {
        point: {
          hoverRadius: 8,
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    },
  })
}

function updateCategoryChart() {
  const ctx = document.getElementById("categoryChart")
  if (!ctx) return

  // Destroy existing chart
  if (categoryChart) {
    categoryChart.destroy()
  }

  // Generate category data
  const categoryData = generateCategoryData()

  categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: categoryData.labels,
      datasets: [
        {
          data: categoryData.values,
          backgroundColor: ["#ff6b6b", "#feca57", "#48dbfb", "#1dd1a1", "#764ba2"],
          borderWidth: 0,
          hoverBorderWidth: 3,
          hoverBorderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              family: "Inter",
              size: 11,
              weight: "500",
            },
            generateLabels: (chart) => {
              const data = chart.data
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i]
                  const percentage = ((value / data.datasets[0].data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)
                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    strokeStyle: data.datasets[0].backgroundColor[i],
                    pointStyle: "circle",
                  }
                })
              }
              return []
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "#667eea",
          borderWidth: 1,
          cornerRadius: 8,
          titleFont: {
            family: "Inter",
            size: 14,
            weight: "600",
          },
          bodyFont: {
            family: "Inter",
            size: 12,
          },
          callbacks: {
            label: (context) => {
              const label = context.label || ""
              const value = context.parsed
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return `${label}: ${value} kg CO₂ (${percentage}%)`
            },
          },
        },
      },
      cutout: "60%",
      elements: {
        arc: {
          borderRadius: 8,
        },
      },
    },
  })
}

function generateMonthlyData() {
  const months = []
  const carbonData = []
  const energyData = []

  // Get last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)

    const monthName = date.toLocaleDateString("fr-FR", { month: "short" })
    months.push(monthName)

    // Filter activities for this month
    const monthActivities = window.EcoTracker.appState.activities.filter((activity) => {
      const activityDate = new Date(activity.date)
      return activityDate.getMonth() === date.getMonth() && activityDate.getFullYear() === date.getFullYear()
    })

    // Calculate totals
    const monthCarbon = monthActivities.reduce((sum, activity) => sum + (activity.carbonFootprint || 0), 0)
    const monthEnergy = monthActivities
      .filter((activity) => activity.type === "electricity" || activity.type === "heating")
      .reduce((sum, activity) => sum + activity.value, 0)

    carbonData.push(Math.round(monthCarbon * 100) / 100)
    energyData.push(Math.round(monthEnergy))
  }

  // Add some sample data if no real data exists
  if (carbonData.every((val) => val === 0)) {
    const sampleCarbon = [45, 52, 38, 41, 35, 42]
    const sampleEnergy = [180, 195, 165, 172, 158, 185]
    return {
      labels: months,
      carbon: sampleCarbon,
      energy: sampleEnergy,
    }
  }

  return {
    labels: months,
    carbon: carbonData,
    energy: energyData,
  }
}

function generateCategoryData() {
  const categories = {
    Transport: 0,
    Électricité: 0,
    Chauffage: 0,
    Eau: 0,
    Déchets: 0,
  }

  // Calculate carbon footprint by category
  window.EcoTracker.appState.activities.forEach((activity) => {
    const carbon = activity.carbonFootprint || 0

    switch (activity.type) {
      case "transport":
        categories["Transport"] += carbon
        break
      case "electricity":
        categories["Électricité"] += carbon
        break
      case "heating":
        categories["Chauffage"] += carbon
        break
      case "water":
        categories["Eau"] += carbon
        break
      case "waste":
        categories["Déchets"] += carbon
        break
    }
  })

  // Filter out zero values
  const labels = []
  const values = []

  Object.entries(categories).forEach(([label, value]) => {
    if (value > 0) {
      labels.push(label)
      values.push(Math.round(value * 100) / 100)
    }
  })

  // Add sample data if no real data
  if (values.length === 0) {
    return {
      labels: ["Transport", "Électricité", "Chauffage", "Eau", "Déchets"],
      values: [35, 28, 20, 10, 7],
    }
  }

  return {
    labels,
    values,
  }
}

// Initialize charts when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Wait for Chart.js to load
  if (typeof Chart !== "undefined") {
    // Set global Chart.js defaults
    Chart.defaults.font.family = "Inter"
    Chart.defaults.color = "#64748b"
    Chart.defaults.borderColor = "rgba(102, 126, 234, 0.1)"

    // Initialize charts after a short delay to ensure DOM is ready
    setTimeout(updateCharts, 500)
  }
})

// Export for use in other modules
window.ChartsManager = {
  updateCharts,
  updateMonthlyChart,
  updateCategoryChart,
}
