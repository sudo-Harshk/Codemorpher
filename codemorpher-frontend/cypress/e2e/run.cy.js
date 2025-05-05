describe('Codemorpher - Run Button Feature', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      console.error('Uncaught exception:', err);
      return false; 
    });

    cy.visit('http://localhost:5500/codemorpher-frontend/public');

    let apiResponse = null;
    cy.intercept('POST', '**/translate', (req) => {
      req.on('response', (res) => {
        apiResponse = res.body; 
      });
    }).as('translateApi');

    cy.get('#javaCode')
      .clear()
      .type(
        `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello! Kiddo...");\n  }\n}`,
        { parseSpecialCharSequences: false }
      );

    cy.get('.lang-option[data-value="javascript"]').click();
    cy.get('#translateButton').click();

    cy.wait('@translateApi', { timeout: 40000 }).its('response.statusCode').should('eq', 200);

    cy.then(() => {
      cy.log('Translation API response:', JSON.stringify(apiResponse));
    });
    cy.get('#translatedCodeBlock').then(($el) => {
      cy.log('Translated code block content:', $el.text());
    });

    cy.get('#translatedCodeBlock', { timeout: 40000 })
      .should('not.contain', 'Translation will appear here...')
      .and('not.be.empty');
  });

  it('should display the Run Code button after translation', () => {
    cy.contains('button', 'Run Code').should('be.visible');
    cy.screenshot('run-button-visible');
  });

  it('should open external compiler when Run Code is clicked', () => {
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
    });

    cy.contains('button', 'Run Code').click();

    cy.get('@windowOpen').should('have.been.calledOnce');
    cy.get('@windowOpen').should('have.been.calledWithMatch', /playcode\.io|compiler-url/);
    cy.screenshot('run-button-clicked');
  });
});