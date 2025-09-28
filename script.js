document.addEventListener('DOMContentLoaded', function () {
  const searchButton = document.getElementById('search-button');
  const usernameInput = document.getElementById('username-input');
  const statsContainer = document.querySelector('.stats-container');
  const easyLabel = document.getElementById('easy-label');
  const mediumLabel = document.getElementById('medium-label');
  const hardLabel = document.getElementById('hard-label');
  const easyCircle = document.querySelector('.easy-progress.circle');
  const mediumCircle = document.querySelector('.medium-progress.circle');
  const hardCircle = document.querySelector('.hard-progress.circle');
  const cardStatsContainer = document.querySelector('.stats-cards');

  function validUserName(username) {
    if (username.trim() === '') {
      alert('Username should not be empty');
      return false;
    }
    const regex = /^[a-zA-Z0-9_]+$/;
    if (!regex.test(username)) {
      alert('Invalid username. Only alphanumeric characters and underscores are allowed.');
      return false;
    }
    return true;
  }

  async function fetchUserDetails(username) {
    const apiUrl = `https://leetcode-stats-api.herokuapp.com/${username}`;
    try {
      searchButton.textContent = 'Searching...';
      searchButton.disabled = true;
      statsContainer.style.display = 'none';
      cardStatsContainer.style.display = 'none';

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const parsedData = await response.json();
      if (parsedData.status === 'error' || !parsedData.totalSolved) {
        throw new Error('User not found or invalid data');
      }
      displayUserData(parsedData);
    } catch (error) {
      statsContainer.innerHTML =
        '<p style="color:red; text-align:center;">Error fetching data. Please try again later.</p>';
      cardStatsContainer.innerHTML = '';
      statsContainer.style.display = 'block';
    } finally {
      searchButton.textContent = 'Search';
      searchButton.disabled = false;
    }
  }

  function updateProgressCircle(solved, total, labelElement, circleElement) {
    labelElement.textContent = `${solved} / ${total}`;
    let percentage = total === 0 ? 0 : (solved / total) * 360;
    circleElement.style.background = `conic-gradient(green ${percentage}deg, #283a2e 0deg)`;
  }

  function displayUserData(data) {
    // update circles
    updateProgressCircle(data.easySolved, data.totalEasy, easyLabel, easyCircle);
    updateProgressCircle(data.mediumSolved, data.totalMedium, mediumLabel, mediumCircle);
    updateProgressCircle(data.hardSolved, data.totalHard, hardLabel, hardCircle);

    // calculate overall submissions from submissionCalendar
    let overallSubmissions = 0;
    if (data.submissionCalendar) {
      overallSubmissions = Object.values(data.submissionCalendar).reduce(
        (sum, val) => sum + val,
        0
      );
    }

    // update cards (only overall submissions available via this API)
    const cardsData = [
      { label: 'Overall Submissions', value: overallSubmissions || 0 },
      { label: 'Easy Solved', value: data.easySolved || 0 },
      { label: 'Medium Solved', value: data.mediumSolved || 0 },
      { label: 'Hard Solved', value: data.hardSolved || 0 }
    ];

    cardStatsContainer.innerHTML = '';
    cardsData.forEach(card => {
      const cardDiv = document.createElement('div');
      cardDiv.classList.add('stat-card');
      cardDiv.innerHTML = `<h3>${card.label}</h3><p>${card.value}</p>`;
      cardStatsContainer.appendChild(cardDiv);
    });

    statsContainer.style.display = 'block';
    cardStatsContainer.style.display = 'flex';
  }

  searchButton.addEventListener('click', function () {
    const username = usernameInput.value;
    if (validUserName(username)) {
      fetchUserDetails(username);
    }
  });
});
