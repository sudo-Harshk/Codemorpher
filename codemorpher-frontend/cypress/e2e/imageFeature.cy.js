describe('📸 Image Upload & Camera Feature Tests', () => {
    const baseUrl = 'http://localhost:5500/codemorpher-frontend/public';
  
    beforeEach(() => {
      cy.visit(baseUrl);
    });
  
    it('should open the upload file dialog and allow image selection', () => {
      cy.get('#uploadImageButton').click();
      cy.get('#uploadInput').selectFile('cypress/fixtures/test-img-2.jpg', { force: true });
  
      cy.get('#javaCode', { timeout: 15000 })
      .should('be.visible')
      .invoke('val')
      .should('include', 'public class');

      
      cy.get('#javaCode').invoke('val').should('include', 'public class');
    });
  
    it('should open and close the camera modal properly', () => {
      cy.get('#cameraButton').click();
      cy.get('#cameraModal').should('be.visible');
      cy.get('#closeCameraButton').click();
      cy.get('#cameraModal').should('not.be.visible');
    });
  
    it('should show camera preview and allow capture button to be visible', () => {
      cy.get('#cameraButton').click();
      cy.get('#cameraPreview').should('be.visible');
      cy.get('#captureButton').should('be.visible');
    });
  });
  