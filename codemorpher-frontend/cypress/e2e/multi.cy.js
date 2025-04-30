describe('Codemorpher - Multi-Language Translation Loop', () => {
  const langs = ['javascript', 'python', 'c', 'cpp', 'csharp', 'php'];

  beforeEach(() => {
    cy.visit('http://localhost:5500/codemorpher-frontend/public');
  });

  langs.forEach((lang) => {
    it(`should translate Java code to ${lang}`, () => {
      cy.get('#javaCode')
        .clear()
        .type(
          `public class Main { public static void main(String[] args) { System.out.println("Loop Test"); } }`,
          { parseSpecialCharSequences: false }
        );

      cy.get(`.lang-option[data-value="${lang}"]`).click();
      cy.get('#translateButton').click();

      cy.get('#translatedCodeBlock', { timeout: 15000 })
      .invoke('text')
      .should((text) => {
      expect(text.trim()).to.not.eq('Translation will appear here...');
      expect(text.trim().length).to.be.greaterThan(10);
      });

      cy.get('#translatedCodeBlock')
        .invoke('text')
        .should('not.be.empty');

      cy.screenshot(`translate-to-${lang}`);
    });
  });
});
