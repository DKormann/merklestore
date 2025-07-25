
export {}

import { startDbConnection } from "./db_connection";
import { htmlElement } from "./html"
import { DbConnection } from "./module_bindings";



async function hashFile(file: File): Promise<bigint> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return BigInt("0x" + hashArray.map(b => b.toString(16).padStart(2, '0')).join(''));
}

startDbConnection().then( dbConnection => {

  function createFileUpload() {
    const container = htmlElement('div', '', 'upload-container', {
      children: [
        htmlElement('h2', 'Document Hasher', 'upload-title'),
        htmlElement('p', 'Select files to hash:', 'upload-description'),
        htmlElement('input', '', 'file-input', {
          attributes: { type: 'file', multiple: 'true' }
        })
      ]
    });

    const fileInput = container.querySelector('.file-input') as HTMLInputElement;

    const statusDiv = htmlElement('div', '', 'status-container');
    const fileInfo = htmlElement('div', '', 'file-info');


    fileInput.addEventListener('change', async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      statusDiv.innerHTML = '';
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          const hash = await hashFile(file);
          fileInfo.innerHTML = '';
          const fileName = htmlElement('div', file.name, 'file-name');
          const fileSize = htmlElement('div', `(${(file.size / 1024).toFixed(2)} KB)`, 'file-size');
          const fileHeader = htmlElement('div', '', 'file-header', {
            children: [fileName, fileSize]
          });
          
          const hashLabel = htmlElement('span', 'SHA-256: ', 'hash-label');
          const hashValue = htmlElement('span', hash.toString(), 'hash-value');
          const hashContainer = htmlElement('div', '', 'hash-container', {
            children: [hashLabel, hashValue]
          });
          
          fileInfo.appendChild(fileHeader);
          fileInfo.appendChild(hashContainer);

          const check_info = htmlElement('div', '', 'check-info');
          fileInfo.appendChild(check_info);


          const checkButton = htmlElement('button', 'Check', 'action-button.check-button', {
            eventListeners: {
              click: async () => {
                const exists = await dbConnection.checkHash(hash);
                const status = htmlElement('div', exists ? '✓ Exists' : '✗ Does not exist', 
                  `status-message.${exists ? 'exists' : 'not-exists'}`);
                check_info.insertBefore(status, check_info.firstChild);
              }
            }
          });
          
          const storeButton = htmlElement('button', 'Store', 'action-button.store-button', {
            eventListeners: {
              click: async () => {
                await dbConnection.storeHash(hash).then(() => {
                  const status = htmlElement('div', '✓ Stored', 'status-message.stored');
                  check_info.insertBefore(status, check_info.firstChild);
                });
              }
            }
          });
          
          const buttonGroup = htmlElement('div', '', 'button-group', {
            children: [checkButton, storeButton]
          });
          
          fileInfo.appendChild(buttonGroup);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          fileInfo.innerHTML = '';
          const errorDiv = htmlElement('div', `Error: ${errorMessage}`, 'error-message');
          fileInfo.appendChild(errorDiv);
        }
        
        statusDiv.appendChild(fileInfo);

          
      }
    });

    container.appendChild(statusDiv);
    return container;
  }
  document.body.appendChild(createFileUpload())
})