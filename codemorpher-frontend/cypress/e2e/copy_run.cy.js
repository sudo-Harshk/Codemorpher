describe('Codemorpher - Copy Feature', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5500/codemorpher-frontend/public');
  });

  it('should translate and copy the code to clipboard', () => {
    const javaCode = `public class Main {
  public static void main(String[] args) {
    System.out.println("Copied!");
  }
}`;

    // Type code and select language
    cy.get('#javaCode').clear().type(javaCode, { delay: 1 });
    cy.get('.lang-option[data-value="javascript"]').click();

    // Click translate and wait for visible output
    cy.get('#translateButton').click();

    // Confirm translation appeared
    cy.get('#translatedCodeBlock', { timeout: 15000 })
      .should('be.visible')
      .invoke('text')
      .should((text) => {
        expect(text.trim()).to.not.eq('Translation will appear here...');
        expect(text.trim().length).to.be.greaterThan(10);
      });

    // Confirm loading overlay is gone
    cy.get('#loadingOverlay', { timeout: 15000 }).should('not.be.visible');

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
