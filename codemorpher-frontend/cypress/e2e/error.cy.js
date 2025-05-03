describe('Codemorpher - Error Handling Scenarios', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5500/codemorpher-frontend/public');
  });

  it('should show alert if translate is clicked without input', () => {
    cy.get('#javaCode').clear();
    cy.get('#translateButton').click();
    cy.on('window:alert', (text) => {
      expect(text).to.include('Please enter code');
    });
  });

  it('should show network error if server is unreachable', () => {
    cy.intercept('POST', '**/translate', { forceNetworkError: true }).as('fakeError');

    cy.get('#javaCode')
      .clear()
      .type('public class Test { public static void main(String[] args) {} }', {
        parseSpecialCharSequences: false,
      });

    cy.get('#translateButton').click();

    // Wait for the network error to be triggered
    cy.wait('@fakeError', { timeout: 10000 });

    // Wait for the loading overlay to appear
    cy.get('#loadingOverlay', { timeout: 10000 }).should('be.visible');

    // Check the dynamically created .error-message element inside #loadingContent
    cy.get('#loadingContent .error-message', { timeout: 10000 })
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const lower = text.toLowerCase();
        expect(lower).to.include('connect'); // Matches "Cannot connect to the server"
      });

    cy.screenshot('network-error-message');
  });
});