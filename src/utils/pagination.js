/**
 * 페이지네이션을 위한 유틸리티 함수
 * @param {Number} totalItems - 총 아이템 개수
 * @param {Number} currentPage - 현재 페이지 번호
 * @param {Number} pageSize - 한 페이지에 표시할 아이템 개수
 * @param {Number} maxPages - 최대 페이지 번호
 * @returns {Object} - { currentPage, totalPages, startPage, endPage, startIndex, endIndex, pages }
*/

const _ = require('lodash');

function paginate(totalItems, currentPage = 1, pageSize = 10) {
    const totalPages = Math.ceil(totalItems / pageSize);
    // 현재 페이지 번호와 페이지 범위를 제한하는 Lodash의 clamp 함수 사용
    currentPage = _.clamp(currentPage, 1, totalPages);

    // 시작페이지와 끝페이지 계산
    const startPage = Math.max(1, currentPage - Math.floor(pageSize / 2));
    const endPage = Math.min(totalPages, startPage + pageSize - 1);

    // 페이지 목록 생성
    const pages = _.range(startPage, endPage + 1);

    return {
        currentPage,
        totalPages,
        startPage,
        endPage,
        pages
    };

}

module.exports = paginate;