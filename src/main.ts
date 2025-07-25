
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
    const container = document.createElement('div');
    container.style.margin = '20px';
    container.style.padding = '20px';
    container.style.border = '1px solid #ddd';
    container.style.borderRadius = '8px';
    container.style.maxWidth = '500px';

    const title = htmlElement('h2', 'Document Hasher', '');
    container.appendChild(title);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    // fileInput.accept = '.pdf,.doc,.docx,.txt,.json,.csv,.md,.txt';
    fileInput.multiple = true;
    fileInput.style.display = 'block';
    fileInput.style.margin = '10px 0';

    const statusDiv = document.createElement('div');
    statusDiv.style.marginTop = '10px';
    statusDiv.style.minHeight = '100px';
    statusDiv.style.borderTop = '1px solid #eee';
    statusDiv.style.paddingTop = '10px';

    const fileInfo = document.createElement('div');
    fileInfo.style.margin = '5px 0';


    fileInput.addEventListener('change', async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      statusDiv.innerHTML = '';
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          const hash = await hashFile(file);
          fileInfo.innerHTML = `
            <strong>${file.name}</strong> (${(file.size / 1024).toFixed(2)} KB)<br>
            <span style="color: #666; font-family: monospace; word-break: break-all;">
                SHA-256: ${hash}
            </span>`;

          const check_info = document.createElement('div');
          check_info.style.margin = '5px 0';
          check_info.style.minHeight = '100px';
          check_info.style.borderTop = '1px solid #eee';
          check_info.style.paddingTop = '10px';
          fileInfo.appendChild(check_info);


          fileInfo.appendChild(htmlElement('button', 'Check', '', {
          onclick: async () => {

            const exists = await dbConnection.checkHash(hash);
            check_info.innerHTML = (`<br><span style="color: ${exists ? 'green' : 'red'}">${exists ? 'Exists' : 'Does not exist'}</span>`) + check_info.innerHTML;
          }
          }))
          fileInfo.appendChild(htmlElement('button', 'Store', '', {
          onclick: async () => {
            await dbConnection.storeHash(hash).then(()=>console.log("stored."))
            check_info.innerHTML = `<br><span style="color: green">Stored</span>` + check_info.innerHTML;
          }
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          fileInfo.innerHTML = `
            <strong>${file.name}</strong> - 
            <span style="color: red;">Error: ${errorMessage}</span>
          `;
        }
        
        statusDiv.appendChild(fileInfo);

          
      }
    });

    container.appendChild(htmlElement('p', 'Select PDF or document files to hash:', ''));
    container.appendChild(fileInput);
    container.appendChild(statusDiv);

    return container;
  }
  document.body.appendChild(createFileUpload())
})