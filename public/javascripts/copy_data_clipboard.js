document.addEventListener('DOMContentLoaded', function() {
       const copyBtn = document.getElementById('copyGroupsBtn');
       if (copyBtn) {
         copyBtn.addEventListener('click', function() {
           let clipboardData = 'Group Name\tAccount Name\tSum\n';
           
           accountGroups.forEach(group => {
             if (group.accounts && group.accounts.length > 0) {
               group.accounts.forEach(account => {
                 clipboardData += `${group.name}\t${account.name}\t${account.sum}\n`;
               });
             }
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