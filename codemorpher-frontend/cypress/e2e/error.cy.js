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
      .type('public class Test { public static void main(String[] args) {} }', {
        parseSpecialCharSequences: false
      });
    cy.get('#translateButton').click();

    cy.get('.error-message', { timeout: 10000 }).should('contain.text', 'Network error');
    cy.screenshot('network-error-message');
  });
});
