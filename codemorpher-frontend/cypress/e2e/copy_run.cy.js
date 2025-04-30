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

    cy.intercept('POST', 'https://codemorpher-backend.onrender.com/translate').as('translate');
    cy.get('#translateButton').click();
    cy.wait('@translate', { timeout: 15000 });

    cy.get('#translatedCodeBlock', { timeout: 15000 })
      .invoke('text')
      .should((text) => {
        expect(text.trim()).to.not.eq('Translation will appear here...');
        expect(text.trim().length).to.be.greaterThan(10);
      });

    cy.get('#loadingOverlay', { timeout: 15000 }).should('not.be.visible');

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alert');
    });

    cy.get('button[onclick="copyToClipboard()"]').click();

    cy.get('@alert').should('have.been.calledWith', '✅ Code copied to clipboard!');

    cy.screenshot('copy-success');
  });
});