import { mount } from '@cypress/react';

import GlobalContextProvider from '../GlobalContext.provider';
import AddGameLibraryForm from './AddGameLibrary.form';

function uploadBoxArt() {
  cy.get(`[data-testid='game-box-art-upload-input']`).selectFile(
    'cypress/fixtures/elden-ring.jpeg',
    {
      force: true,
    },
  );
}

function fillAddGameLibraryForm() {
  cy.get(`[data-testid='game-name-input']`).click().clear().type('ELDEN RING');
  cy.get(`[data-testid='game-publisher-input']`)
    .clear()
    .type('SONY INTERACTIVE ENTERTAINMENT');

  cy.get(`[data-testid='game-platform-input']`).click();
  cy.get(`[data-testid='game-platform-input-ps5']`).click();
  cy.get(`[data-testid='number-of-players-input']`).click().clear().type('1');
  cy.get(`[data-testid='genre-input']`).click();
  cy.get(`[data-testid='genre-input-action']`).click();
  cy.get(`[data-testid='release-date-input']`)
    .click()
    .clear()
    .type('03/24/2022');
}

describe('AddGameLibraryForm', () => {
  it('should create record on db when submit form', () => {
    mount(
      <GlobalContextProvider>
        <AddGameLibraryForm />
      </GlobalContextProvider>,
    );
    uploadBoxArt();
    fillAddGameLibraryForm();
    cy.get(`[data-testid='submit-add-new-game-form']`).click();
    cy.get(`[data-testid='created-game-id']`)
      .should('be.visible')
      .then(el => {
        const gameId = el.text();
        cy.request({
          method: 'GET',
          url: `http://localhost:5333/test/seeder/game/${gameId}`,
        })
          .its('body.data.id')
          .should('equal', gameId);
      });
  });

  it('should should error when number of player less than 0', () => {
    mount(
      <GlobalContextProvider>
        <AddGameLibraryForm />
      </GlobalContextProvider>,
    );
    cy.get(`[data-testid='number-of-players-input']`)
      .click()
      .clear()
      .type('-1');
    cy.get('body').click();
    cy.get(`[data-testid='number-of-players-error']`).should(
      'have.text',
      "number of players can't less than 0",
    );
  });

  it('should should error when missing box art', () => {
    mount(
      <GlobalContextProvider>
        <AddGameLibraryForm />
      </GlobalContextProvider>,
    );
    fillAddGameLibraryForm();
    cy.get(`[data-testid='submit-add-new-game-form']`).click();
    cy.get(`[data-testid='game-box-art-upload-error']`).should(
      'have.text',
      'box art must be provided',
    );
  });
});