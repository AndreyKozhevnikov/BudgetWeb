document.addEventListener('DOMContentLoaded', function() {
       const copyBtn = document.getElementById('copyGroupsBtn');
       if (copyBtn) {
         copyBtn.addEventListener('click', function() {
           let clipboardData = '';
           
           accountGroups.forEach(group => {
             // Add group name as header
             clipboardData += `${group.name}\t\n`;
             
             // Add accounts under the group
             if (group.accounts && group.accounts.length > 0) {
               group.accounts.forEach(account => {
                 clipboardData += `${account.name}\t${account.sum}\n`;
               });
             }
             clipboardData += `Sum\t${group.sum}\t\n`;
             clipboardData += `\n`;
           });
           
           navigator.clipboard.writeText(clipboardData).then(() => {
             // Temporarily change button text to show success
             const originalText = copyBtn.textContent;
             copyBtn.textContent = 'Copied!';
             copyBtn.style.background = '#28a745';
             setTimeout(() => {
               copyBtn.textContent = originalText;
               copyBtn.style.background = '#4285f4';
             }, 1500);
           }).catch(err => {
             console.error('Failed to copy to clipboard:', err);
             alert('Failed to copy to clipboard. Please try again.');
           });
         });
       }
     });