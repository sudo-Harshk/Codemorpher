describe('📸 Image Upload & Camera Feature Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5500/codemorpher-frontend/public');

    cy.window().then((win) => {
      cy.stub(win.navigator.mediaDevices, 'getUserMedia').rejects(new DOMException('No back camera available.', 'OverconstrainedError'));
    });
  });

  it('should display the Skip button when no back camera is available', () => {
    cy.get('#cameraButton').click();

    cy.get('#cameraError', { timeout: 5000 }).should('be.visible').and('contain', 'No back camera available');

    cy.get('.skip-button', { timeout: 5000 }).should('be.visible').and('contain', 'Skip');
  });

  it('should return to the home page when the Skip button is clicked', () => {
    cy.get('#cameraButton').click();

    cy.get('#cameraError', { timeout: 5000 }).should('be.visible').and('contain', 'No back camera available');

    cy.get('.skip-button', { timeout: 5000 }).click();

    cy.get('#cameraError', { timeout: 5000 }).should('not.be.visible');

    cy.get('#cameraModal', { timeout: 5000 }).should('not.be.visible');

    cy.get('.header-with-logo', { timeout: 5000 }).should('be.visible');
    cy.get('#javaCode', { timeout: 5000 }).should('be.visible');
    cy.get('#translateButton', { timeout: 5000 }).should('be.visible');
  });
});
