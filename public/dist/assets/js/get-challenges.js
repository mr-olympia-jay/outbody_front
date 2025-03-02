// const getChallengesPort = 'http://localhost:3000';
const getChallengesPort = 'https://wildbody-server.shop';

const getChallengesToken = localStorage.getItem('cookie');
const expiration = localStorage.getItem('tokenExpiration');
const isTokenExpired = new Date().getTime() > expiration;

if (!getChallengesToken || isTokenExpired) {
  localStorage.setItem('cookie', '');
  localStorage.setItem('tokenExpiration', '');
  const inoutBtn = $('#logout-button');
  $('.profile-button').css('display', 'none');
  $('.regi-chalenge').css('display', 'none');
  $(inoutBtn).text('Login');
  setTimeout(() => {
    alert('로그인이 필요한 기능입니다.');
  }, 500);
} else {
  const inoutBtn = $('#logout-button');
  $(inoutBtn).html('<i class="fas fa-sign-out-alt"></i> Logout');
}

const filterApplyButton = document.querySelector('#filter-apply-button');
const challengeFilter = $('#challenge-filter');
let option = 'all';
initChallengeList(option);

filterApplyButton.addEventListener('click', () => {
  option = challengeFilter.val();
  initChallengeList(option);
});

// 도전 목록 조회
async function initChallengeList(option) {
  let nowPage = 1;
  await axios
    .get(`${getChallengesPort}/challenge?filter=${option}&page=${1}`, {
      headers: {
        Authorization: getChallengesToken,
      },
    })
    .then((response) => {
      const challengeTable = document.querySelector('#challenge-table');
      challengeTable.innerHTML = `<tr>
          <th>제목</th>
          <th>기간</th>
          <th>목표</th>
          <th>점수</th>
          <th>인원</th>
          <th>작성자</th>
          <th>공개 여부</th>
          <th></th>
        </tr>`;
      challengeTable.innerHTML += response.data.data.challenges
        .map((challenge) => {
          const profileImage = challenge.hostImageUrl
            ? `inflearn-nest-cat.s3.amazonaws.com/${challenge.hostImageUrl}`
            : `assets/img/avatar/avatar-1.png`;

          let publicView = challenge.publicView;
          if (publicView === true) {
            publicView = '전체';
          } else if (publicView === false) {
            publicView = '비공개';
          }

          return `<tr id="${challenge.id}">
          <td>${challenge.title}</td>
          <td>${challenge.startDate} ~ ${challenge.endDate} (${
            challenge.challengeWeek
          }주)</td>
          <td class="challenges-list">
            <div class="challenge-list">
              오운완 출석<span class="badge challenge-span">${
                challenge.goalAttend
              }일</span>
            </div>
            <div class="challenge-list">
              체중 <span class="badge challenge-span">-${
                challenge.goalWeight
              }kg</span>
            </div>
            <div class="challenge-list">
              골격근량 <span class="badge challenge-span">+${
                challenge.goalMuscle
              }kg</span>
            </div>
            <div class="challenge-list">
              체지방률 <span class="badge challenge-span">-${
                challenge.goalFat
              }%</span>
            </div>
          </td>
          <td>
           <div class="challenges-point">
            <div class="challenge-fail">
              실패 시<span class="badge fail-span">-${
                challenge.entryPoint
              }점</span>
            </div>
            <div class="challenge-success">
              성공 시 최대<span class="badge success-span">+${
                challenge.entryPoint * challenge.userNumber
              }점</span>
            </div>
           </div>
          </td>
          <td>${challenge.userNumber} / ${challenge.userNumberLimit}명</td>
          <td>
          <img id="profile-image" alt="image"
          src="${profileImage}"
          style="border-radius:50%; width:35px; height:35px;" data-toggle="title" title="">
            <div class="d-inline-block ml-1">${challenge.hostName}</div>
          </td>
          <td>${publicView}</td>
          <td>
            <a href="get-one-challenge.html?id=${challenge.id}">
              <button class="btn btn-primary" style="border-radius: 20px;">
                보기
              </button>
            </a>
          </td>
          </tr>`;
        })
        .join('');

      const pagenationTag = $('.pagination');
      const prevButton = `<li id="prev_button" class="page-item">
                            <a class="page-link">이전</a>
                          </li>`;
      const nextButton = `<li id="next_button" class="page-item">
                            <a class="page-link">다음</a>
                          </li>`;

      let pageNumbers = '';
      let pageNumbersHtml = '';

      const totalPages = response.data.data.totalPages;

      for (let i = 1; i <= totalPages; i++) {
        pageNumbers += `<li class="page-item page_number">
                          <a id="nowPage-${i}" class="page-link">${i}</a>
                        </li>`;
      }

      pageNumbersHtml = prevButton + pageNumbers + nextButton;
      $(pagenationTag).html(pageNumbersHtml);

      const prevBtn = $('#prev_button');
      const nextBtn = $('#next_button');
      const pages = $('.page_number');

      $(pages)
        .find(`#nowPage-${nowPage}`)
        .css('background-color', 'rgb(103,119,239)');
      $(pages).find(`#nowPage-${nowPage}`).css('color', 'white');

      // Previous Button Clicked
      $(prevBtn).click(async () => {
        if (nowPage > 1) {
          try {
            $(pages).find('.page-link').css('background-color', '');
            $(pages).find('.page-link').css('color', '');

            const { data } = await getChallenges(option, nowPage - 1);

            challengeTable.innerHTML = `<tr>
                <th>제목</th>
                <th>기간</th>
                <th>목표</th>
                <th>점수</th>
                <th>인원</th>
                <th>작성자</th>
                <th>공개 여부</th>
                <th></th>
              </tr>`;

            challengeTable.innerHTML += data.challenges
              .map((challenge) => {
                const profileImage = challenge.hostImageUrl
                  ? `inflearn-nest-cat.s3.amazonaws.com/${challenge.hostImageUrl}`
                  : `assets/img/avatar/avatar-1.png`;

                let publicView = challenge.publicView;
                if (publicView === true) {
                  publicView = '전체';
                } else if (publicView === false) {
                  publicView = '비공개';
                }

                return `<tr id="${challenge.id}">
            <td>${challenge.title}</td>
            <td>${challenge.startDate} ~ ${challenge.endDate} (${
                  challenge.challengeWeek
                }주)</td>
            <td>
              <button class="btn btn-primary">
                오운완 출석<span class="badge badge-transparent">${
                  challenge.goalAttend
                }일</span>
              </button>
              <button class="btn btn-primary">
                체중 <span class="badge badge-transparent">-${
                  challenge.goalWeight
                }kg</span>
              </button>
              <button class="btn btn-primary">
                골격근량 <span class="badge badge-transparent">+${
                  challenge.goalMuscle
                }kg</span>
              </button>
              <button class="btn btn-primary">
                체지방률 <span class="badge badge-transparent">-${
                  challenge.goalFat
                }%</span>
              </button>
            </td>
            <td>
              <button class="btn btn-danger">
                실패 시<span class="badge badge-transparent">-${
                  challenge.entryPoint
                }점</span>
              </button>
              <button class="btn btn-success">
                성공 시 최대<span class="badge badge-transparent">+${
                  challenge.entryPoint * challenge.userNumber
                }점</span>
              </button>
            </td>
            <td>${challenge.userNumber} / ${challenge.userNumberLimit}명</td>
            <td>
            <img id="profile-image" alt="image"
            src="${profileImage}"
            class="rounded-circle" width="35" data-toggle="title" title="">
              <div class="d-inline-block ml-1">${challenge.hostName}</div>
            </td>
            <td>${publicView}</td>
            <td>
              <a href="get-one-challenge.html?id=${challenge.id}">
                <button class="btn btn-primary" style="border-radius: 20px;">
                  보기
                </button>
              </a>
            </td>
            </tr>`;
              })
              .join('');

            nowPage -= 1;

            $(pages)
              .find(`#nowPage-${nowPage}`)
              .css('background-color', 'rgb(103,119,239)');
            $(pages).find(`#nowPage-${nowPage}`).css('color', 'white');
          } catch (error) {
            alert(error.response.data.message);
          }
        }
      });

      // Next Button Clicked
      $(nextBtn).click(async () => {
        if (nowPage > 0 && nowPage < totalPages) {
          try {
            $(pages).find('.page-link').css('background-color', '');
            $(pages).find('.page-link').css('color', '');

            const { data } = await getChallenges(option, nowPage + 1);

            challengeTable.innerHTML = `<tr>
                <th>제목</th>
                <th>기간</th>
                <th>목표</th>
                <th>점수</th>
                <th>인원</th>
                <th>작성자</th>
                <th>공개 여부</th>
                <th></th>
              </tr>`;

            challengeTable.innerHTML += data.challenges
              .map((challenge) => {
                const profileImage = challenge.hostImageUrl
                  ? `inflearn-nest-cat.s3.amazonaws.com/${challenge.hostImageUrl}`
                  : `assets/img/avatar/avatar-1.png`;

                let publicView = challenge.publicView;
                if (publicView === true) {
                  publicView = '전체';
                } else if (publicView === false) {
                  publicView = '비공개';
                }

                return `<tr id="${challenge.id}">
            <td>${challenge.title}</td>
            <td>${challenge.startDate} ~ ${challenge.endDate} (${
                  challenge.challengeWeek
                }주)</td>
            <td>
              <button class="btn btn-primary">
                오운완 출석<span class="badge badge-transparent">${
                  challenge.goalAttend
                }일</span>
              </button>
              <button class="btn btn-primary">
                체중 <span class="badge badge-transparent">-${
                  challenge.goalWeight
                }kg</span>
              </button>
              <button class="btn btn-primary">
                골격근량 <span class="badge badge-transparent">+${
                  challenge.goalMuscle
                }kg</span>
              </button>
              <button class="btn btn-primary">
                체지방률 <span class="badge badge-transparent">-${
                  challenge.goalFat
                }%</span>
              </button>
            </td>
            <td>
              <button class="btn btn-danger">
                실패 시<span class="badge badge-transparent">-${
                  challenge.entryPoint
                }점</span>
              </button>
              <button class="btn btn-success">
                성공 시 최대<span class="badge badge-transparent">+${
                  challenge.entryPoint * challenge.userNumber
                }점</span>
              </button>
            </td>
            <td>${challenge.userNumber} / ${challenge.userNumberLimit}명</td>
            <td>
            <img id="profile-image" alt="image"
            src="${profileImage}"
            class="rounded-circle" width="35" data-toggle="title" title="">
              <div class="d-inline-block ml-1">${challenge.hostName}</div>
            </td>
            <td>${publicView}</td>
            <td>
              <a href="get-one-challenge.html?id=${challenge.id}">
                <button class="btn btn-primary" style="border-radius: 20px;">
                  보기
                </button>
              </a>
            </td>
            </tr>`;
              })
              .join('');

            nowPage += 1;

            $(pages)
              .find(`#nowPage-${nowPage}`)
              .css('background-color', 'rgb(103,119,239)');
            $(pages).find(`#nowPage-${nowPage}`).css('color', 'white');
          } catch (error) {
            alert(error.response.data.message);
          }
        }
      });

      // Each Page Clicked
      $(pages).each((index, page) => {
        $(page).click(async () => {
          $(pages).find('.page-link').css('background-color', '');
          $(pages).find('.page-link').css('color', '');

          try {
            const { data } = await getChallenges(
              option,
              parseInt($(page).find(`.page-link`).text()),
            );

            challengeTable.innerHTML = `<tr>
                <th>제목</th>
                <th>기간</th>
                <th>목표</th>
                <th>점수</th>
                <th>인원</th>
                <th>작성자</th>
                <th>공개 여부</th>
                <th></th>
              </tr>`;

            challengeTable.innerHTML += data.challenges
              .map((challenge) => {
                const profileImage = challenge.hostImageUrl
                  ? `inflearn-nest-cat.s3.amazonaws.com/${challenge.hostImageUrl}`
                  : `assets/img/avatar/avatar-1.png`;

                let publicView = challenge.publicView;
                if (publicView === true) {
                  publicView = '전체';
                } else if (publicView === false) {
                  publicView = '비공개';
                }

                return `<tr id="${challenge.id}">
            <td>${challenge.title}</td>
            <td>${challenge.startDate} ~ ${challenge.endDate} (${
                  challenge.challengeWeek
                }주)</td>
            <td>
              <button class="btn btn-primary">
                오운완 출석<span class="badge badge-transparent">${
                  challenge.goalAttend
                }일</span>
              </button>
              <button class="btn btn-primary">
                체중 <span class="badge badge-transparent">-${
                  challenge.goalWeight
                }kg</span>
              </button>
              <button class="btn btn-primary">
                골격근량 <span class="badge badge-transparent">+${
                  challenge.goalMuscle
                }kg</span>
              </button>
              <button class="btn btn-primary">
                체지방률 <span class="badge badge-transparent">-${
                  challenge.goalFat
                }%</span>
              </button>
            </td>
            <td>
              <button class="btn btn-danger">
                실패 시<span class="badge badge-transparent">-${
                  challenge.entryPoint
                }점</span>
              </button>
              <button class="btn btn-success">
                성공 시 최대<span class="badge badge-transparent">+${
                  challenge.entryPoint * challenge.userNumber
                }점</span>
              </button>
            </td>
            <td>${challenge.userNumber} / ${challenge.userNumberLimit}명</td>
            <td>
            <img id="profile-image" alt="image"
            src="${profileImage}"
            class="rounded-circle" width="35" data-toggle="title" title="">
              <div class="d-inline-block ml-1">${challenge.hostName}</div>
            </td>
            <td>${publicView}</td>
            <td>
              <a href="get-one-challenge.html?id=${challenge.id}">
                <button class="btn btn-primary" style="border-radius: 20px;">
                  보기
                </button>
              </a>
            </td>
            </tr>`;
              })
              .join('');

            nowPage = parseInt($(page).find(`.page-link`).text());

            $(pages)
              .find(`#nowPage-${nowPage}`)
              .css('background-color', 'rgb(103,119,239)');
            $(pages).find(`#nowPage-${nowPage}`).css('color', 'white');
          } catch (error) {
            alert(error.response.data.message);
          }
        });
      });
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
}

// 도전 목록 조회 함수
async function getChallenges(option, page) {
  try {
    const { data } = await axios.get(
      `${getChallengesPort}/challenge?filter=${option}&page=${page}`,
      {
        headers: {
          Authorization: getChallengesToken,
        },
      },
    );
    return data;
  } catch (error) {
    alert(error.response.data.message);
  }
}
