describe('Codemorpher - Image Upload Feature', () => {
    it('should upload an image and paste Java code into textarea', () => {
      // Visit the local frontend served via live server or similar
      cy.visit('http://localhost:5500/codemorpher-frontend/public');
  
      // Trigger image upload using fixture
      cy.get('#uploadInput').selectFile('cypress/fixtures/test-img-1.jpeg', { force: true });
  
      // Wait for loading overlay to disappear (in case Gemini API takes time)
      cy.get('#loadingOverlay', { timeout: 30000 }).should('not.be.visible');
  
      // Confirm Java code was pasted in textarea
      cy.get('#javaCode')
        .invoke('val')
        .should('include', 'public class'); // Java signature check
  
      // Optional: check if the line count also updated
      cy.get('#lineCounter').should('contain', 'Lines:');
    });
  });
  