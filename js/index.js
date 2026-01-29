let mode = "single";
const searchArea = document.getElementById("search-area");
const result = document.getElementById("result");

setMode("single");

// ---------- MODE SWITCH ----------
function setMode(selectedMode) {
  mode = selectedMode;
  result.innerHTML = "";

  if (mode === "single") {
    searchArea.innerHTML = `
      <input id="username" placeholder="GitHub username" />
      <button onclick="searchUser()">Search</button>
    `;
  } else {
    searchArea.innerHTML = `
      <input id="user1" placeholder="User 1" />
      <input id="user2" placeholder="User 2" />
      <button onclick="battle()">Battle</button>
    `;
  }
}

// ---------- FETCH USER ----------
async function fetchUser(username) {
  const userRes = await fetch(`https://api.github.com/users/${username}`);
  if (!userRes.ok) throw new Error("User not found");

  const userData = await userRes.json();

  const repoRes = await fetch(userData.repos_url);
  const repoData = await repoRes.json();

  return { userData, repoData };
}

// ---------- DATE FORMAT ----------
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// ---------- CREATE CARD ----------
function createCard(user, repos, highlight = "") {
  const topRepos = repos
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return `
    <div class="card ${highlight}">
      <img src="${user.avatar_url}" />
      <h2>${user.name || user.login}</h2>
      <p>${user.bio || "No bio"}</p>
      <p>Joined: ${formatDate(user.created_at)}</p>
      <p>Followers: ${user.followers}</p>
      <a href="${user.html_url}" target="_blank">GitHub Profile</a>

      <h3>Latest Repos</h3>
      ${topRepos.map(repo => `
        <div class="repo">
          <a href="${repo.html_url}" target="_blank">${repo.name}</a>
        </div>
      `).join("")}
    </div>
  `;
}

// ---------- SINGLE SEARCH ----------
async function searchUser() {
  const username = document.getElementById("username").value.trim();
  if (!username) return;

  result.innerHTML = `<p class="loading">Loading...</p>`;

  try {
    const { userData, repoData } = await fetchUser(username);
    result.innerHTML = createCard(userData, repoData);
  } catch (err) {
    result.innerHTML = `<p>User Not Found ❌</p>`;
  }
}

// ---------- BATTLE MODE ----------
async function battle() {
  const u1 = document.getElementById("user1").value.trim();
  const u2 = document.getElementById("user2").value.trim();

  if (!u1 || !u2) return;

  result.innerHTML = `<p class="loading">Battling...</p>`;

  try {
    const [data1, data2] = await Promise.all([
      fetchUser(u1),
      fetchUser(u2)
    ]);

    let winner1 = "";
    let winner2 = "";

    if (data1.userData.followers > data2.userData.followers) {
      winner1 = "winner";
      winner2 = "loser";
    } else if (data2.userData.followers > data1.userData.followers) {
      winner2 = "winner";
      winner1 = "loser";
    }

    result.innerHTML =
      createCard(data1.userData, data1.repoData, winner1) +
      createCard(data2.userData, data2.repoData, winner2);

  } catch (err) {
    result.innerHTML = `<p>One or both users not found ❌</p>`;
  }
}
