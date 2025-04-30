describe('Codemorpher - UI Components Check', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5500/codemorpher-frontend/public');
  });

  it('should display the header with logo and title', () => {
    cy.get('.header-with-logo').should('be.visible');
    cy.get('.logo-icon').should('be.visible');
    cy.contains('CodeMorpher').should('be.visible');
    cy.screenshot('ui-header');
  });

  it('should have the Java code input area', () => {
    cy.get('#javaCode').should('exist').and('be.visible');
    cy.screenshot('ui-java-code-input');
  });

  it('should display all target language options', () => {
    const languages = ['javascript', 'python', 'c', 'cpp', 'csharp', 'php'];
    languages.forEach(lang => {
      cy.get(`.lang-option[data-value="${lang}"]`).should('exist').and('be.visible');
    });
    cy.screenshot('ui-language-options');
  });

  it('should display the Translate button', () => {
    cy.get('#translateButton').should('be.visible').and('contain', 'Translate');
    cy.screenshot('ui-translate-button');
  });

  it('should show collapsed output sections initially', () => {
    cy.get('#translatedCode').should('exist');
    cy.get('#debuggingSteps').should('have.class', 'collapsed');
    cy.get('#algorithm').should('have.class', 'collapsed');
    cy.screenshot('ui-collapsed-output-sections');
  });
});
