describe('Codemorpher - Copy Feature', () => {
  beforeEach(() => {
    // Prevent uncaught exceptions from failing the test
    cy.on('uncaught:exception', (err, runnable) => {
      console.error('Uncaught exception:', err);
      return false; // Prevent test failure
    });

    cy.visit('http://localhost:5500/codemorpher-frontend/public');
  });

  it('should translate and copy the code to clipboard', () => {
    const javaCode = `public class Main {
  public static void main(String[] args) {
    System.out.println("Copied!");
  }
}`;

    // Intercept translation API and store response
    let apiResponse = null;
    cy.intercept('POST', '**/translate', (req) => {
      req.on('response', (res) => {
        apiResponse = res.body; // Store response for later logging
      });
    }).as('translateApi');

    // Type code and select language
    cy.get('#javaCode').clear().type(javaCode, { delay: 1 });
    cy.get('.lang-option[data-value="javascript"]').click();

    // Click translate and wait for API response
    cy.get('#translateButton').click();
    cy.wait('@translateApi', { timeout: 40000 }).its('response.statusCode').should('eq', 200);

    // Log API response after intercept
    cy.then(() => {
      cy.log('Translation API response:', JSON.stringify(apiResponse));
    });

    // Log overlay state for debugging
    cy.get('#loadingOverlay').then(($el) => {
      cy.log('Loading overlay display:', $el.css('display'));
    });

    // Confirm loading overlay is gone
    cy.get('#loadingOverlay', { timeout: 40000 }).should('have.css', 'display', 'none');

    // Confirm translation appeared
    cy.get('#translatedCodeBlock', { timeout: 40000 })
      .should('be.visible')
      .invoke('text')
      .should((text) => {
        expect(text.trim()).to.not.eq('Translation will appear here...');
        expect(text.trim().length).to.be.greaterThan(10);
      });

    // Stub the window alert
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alert');
    });

    // Trigger the copy button
    cy.get('button[onclick="copyToClipboard()"]').click();

    // Check alert content
    cy.get('@alert').should('have.been.calledWith', '✅ Code copied to clipboard!');

    cy.screenshot('copy-success');
  });
});