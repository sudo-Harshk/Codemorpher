describe('Codemorpher Home Page', () => {
  it('should load successfully and display title', () => {
    cy.visit('http://localhost:5500/codemorpher-frontend/public');
    cy.contains('CodeMorpher').should('be.visible');
    cy.screenshot('homepage-loaded');
  });
});
