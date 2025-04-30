describe('Codemorpher - Run Button Feature', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5500/codemorpher-frontend/public');

    cy.get('#javaCode')
      .clear()
      .type(
        `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello! Kiddo...");\n  }\n}`,
        { parseSpecialCharSequences: false }
      );

    cy.get('.lang-option[data-value="javascript"]').click();
    cy.get('#translateButton').click();

    cy.get('#translatedCodeBlock', { timeout: 20000 }) 
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