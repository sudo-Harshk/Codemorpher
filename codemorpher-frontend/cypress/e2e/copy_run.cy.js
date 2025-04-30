describe('Codemorpher - Copy Feature', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5500/codemorpher-frontend/public');
  });

  it('should translate and copy the code to clipboard', () => {
    cy.get('#javaCode')
      .clear()
      .type(`public class Main {
  public static void main(String[] args) {
    System.out.println("Copied!");
  }
}`);

    cy.get('.lang-option[data-value="javascript"]').click();

    cy.get('#translateButton').click();

    cy.get('#translatedCodeBlock', { timeout: 10000 })
      .should('not.contain.text', 'Translation will appear here...')
      .and('not.be.empty');

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alert');
    });

    cy.contains('Copy to Clipboard').click();

    cy.get('@alert').should('have.been.calledWith', '✅ Code copied to clipboard!');

    cy.screenshot('copy-success');
  });
});
