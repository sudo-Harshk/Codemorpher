describe('Codemorpher - Translate Feature', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5500/codemorpher-frontend/public');
  });

  it('should translate Java code and display result', () => {
    cy.get('#javaCode')
      .clear()
      .type(`public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello Kiddo");\n  }\n}`);

    cy.get('.lang-option[data-value="javascript"]').click();

    cy.get('#translateButton').click();

    cy.get('#translatedCodeBlock', { timeout: 15000 })
      .should('not.contain.text', 'Translation will appear here...')
      .invoke('text')
      .should('include', 'console.log');

    cy.screenshot('translation-success');
  });
});
