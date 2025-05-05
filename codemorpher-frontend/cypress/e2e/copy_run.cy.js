describe('Codemorpher - Copy Feature', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      console.error('Uncaught exception:', err);
      return false; 
    });

    cy.visit('http://localhost:5500/codemorpher-frontend/public');
  });

  it('should translate and copy the code to clipboard', () => {
    const javaCode = `public class Main {
  public static void main(String[] args) {
    System.out.println("Copied!");
  }
}`;

    let apiResponse = null;
    cy.intercept('POST', '**/translate', (req) => {
      req.on('response', (res) => {
        apiResponse = res.body; 
      });
    }).as('translateApi');

    cy.get('#javaCode').clear().type(javaCode, { delay: 1 });
    cy.get('.lang-option[data-value="javascript"]').click();

    cy.get('#translateButton').click();
    cy.wait('@translateApi', { timeout: 40000 }).its('response.statusCode').should('eq', 200);

    cy.then(() => {
      cy.log('Translation API response:', JSON.stringify(apiResponse));
    });

    cy.get('#loadingOverlay').then(($el) => {
      cy.log('Loading overlay display:', $el.css('display'));
    });

    cy.get('#loadingOverlay', { timeout: 40000 }).should('have.css', 'display', 'none');

    cy.get('#translatedCodeBlock', { timeout: 40000 })
      .should('be.visible')
      .invoke('text')
      .should((text) => {
        expect(text.trim()).to.not.eq('Translation will appear here...');
        expect(text.trim().length).to.be.greaterThan(10);
      });

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alert');
    });

    cy.get('button[onclick="copyToClipboard()"]').click();

    cy.get('@alert').should('have.been.calledWith', '✅ Code copied to clipboard!');

    cy.screenshot('copy-success');
  });
});