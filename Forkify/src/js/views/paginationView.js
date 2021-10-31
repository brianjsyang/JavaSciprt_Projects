import View from './view';
import icons from 'url:../../img/icons.svg'; // Parcel v.2

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      // Event Delegation ...
      const btn = e.target.closest('.btn--inline');

      if (!btn) return;

      const goToPage = +btn.dataset.goto;

      handler(goToPage);
    });
  }

  _generateMarkUp() {
    const currPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    // prettier-ignore
    const prevMarkUp = 
        `<button data-goto="${currPage - 1}" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>${currPage - 1}</span>
        </button>`;

    // prettier-ignore
    const nextMarkUp = 
        `<button data-goto="${currPage + 1}" class="btn--inline pagination__btn--next">
            <span>${currPage + 1}</span>
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-right"></use>
            </svg>
        </button> `;

    // 1) Page 1, there are other pages
    if (currPage === 1 && numPages > 1) {
      return nextMarkUp;
    }

    // 3) Last page
    if (currPage === numPages && numPages > 1) {
      return prevMarkUp;
    }

    // 4) Other pages
    if (currPage < numPages) {
      return prevMarkUp + nextMarkUp;
    }

    // 2) Page 1, no other pages
    return '';
  }
}

export default new PaginationView();
