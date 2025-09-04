        function getTier(points) {
  const tiers = [
    { name: "Bronze",   min: 0,     max: 10000,   fee: 5 },
    { name: "Silver",   min: 10001, max: 50000,   fee: 3 },
    { name: "Gold",     min: 50001, max: 100000,  fee: 2 },
    { name: "Platinum", min: 100001, max: Infinity, fee: 1 }
  ];
  let idx = 0;
  for (let i = 0; i < tiers.length; i++) {
    if (points >= tiers[i].min && points <= tiers[i].max) { idx = i; break; }
  }
  const current = tiers[idx];
  const next = idx < tiers.length - 1 ? tiers[idx + 1] : null;
  const cap = tiers[tiers.length - 2].max; // 100,000 = last finite tier
  return { tiers, current, next, cap };
}


        function calculateTrust() {
  const trustPoints = parseInt(document.getElementById('trust-points').value) || 0;
  const goldAmount  = parseInt(document.getElementById('gold-amount').value) || 0;

  document.getElementById('display-trust').textContent  = trustPoints.toLocaleString();
  document.getElementById('display-gold').textContent   = goldAmount.toLocaleString();
  document.getElementById('current-trust').textContent  = trustPoints.toLocaleString();

  // Update tier / progress bar
  updateTrustLevel(trustPoints);

  // Base fee (always 5% baseline)
  const baseFee = Math.floor(goldAmount * 0.05);
  document.getElementById('base-fee').textContent = baseFee.toLocaleString() + ' gold';

  // Coverage and penalty
  let trustCoverageText = '';
  let additionalFee = 0;
  let trustCoverageClass = 'success';

  if (trustPoints >= goldAmount) {
    trustCoverageText = 'Full coverage (no penalty)';
    additionalFee = 0;
  } else {
    const untrustedAmount = goldAmount - trustPoints;
    additionalFee = Math.floor(untrustedAmount * 0.25);
    trustCoverageText = 'Partial coverage (' + untrustedAmount.toLocaleString() + ' gold untrusted)';
    trustCoverageClass = 'warning';
  }

  document.getElementById('trust-coverage').textContent = trustCoverageText;
  document.getElementById('trust-coverage').className = trustCoverageClass;
  document.getElementById('additional-fee').textContent = additionalFee.toLocaleString() + ' gold';

  // Use the CURRENT TIER fee when fully trusted
  const { current } = getTier(trustPoints);
  let yourFee = 0;

  if (trustPoints >= goldAmount) {
    yourFee = Math.floor(goldAmount * (current.fee / 100));
    // Update "Your fee (X%)" label
    document.querySelector('#your-fee').previousElementSibling.textContent = `Your fee (${current.fee}%):`;
  } else {
    yourFee = baseFee + additionalFee; // base 5% + penalty
    document.querySelector('#your-fee').previousElementSibling.textContent = `Your fee (base 5% + penalty):`;
  }

  document.getElementById('your-fee').textContent = yourFee.toLocaleString() + ' gold';

  // Total
  const totalCost = goldAmount + yourFee;
  document.getElementById('total-cost').textContent = 'Total cost: ' + totalCost.toLocaleString() + ' gold';
}

        
function updateTrustLevel(trustPoints) {
  const { current, next, cap } = getTier(trustPoints);

  // Tier labels
  document.getElementById('tier-value').textContent = current.name;
  document.getElementById('next-tier').textContent = next
    ? `${next.name} (${next.min.toLocaleString()} TP)`
    : `Max Tier`;

  // Fee table
  document.getElementById('mail-fee').textContent = current.fee + "%";
  document.getElementById('trade-fee').textContent = current.fee + "%";
  document.getElementById('request-fee').textContent = current.fee + "%";

  // Continuous progress: 0..100,000 → 0..100%
  const clamped = Math.max(0, Math.min(trustPoints, cap));
  let progressPercentage = (clamped / cap) * 100;
  progressPercentage = Math.max(0, Math.min(progressPercentage, 100));

  document.getElementById('progress-fill').style.width = progressPercentage + '%';
  document.getElementById('trust-percentage').textContent = progressPercentage.toFixed(1) + '%';
}


        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Calculate initial values
            calculateTrust();
            
            // Add event listeners for input changes
            document.getElementById('trust-points').addEventListener('input', function() {
                const trustPoints = parseInt(this.value) || 0;
                document.getElementById('current-trust').textContent = trustPoints.toLocaleString();
                updateTrustLevel(trustPoints);
                calculateTrust();
            });
            
            document.getElementById('gold-amount').addEventListener('input', calculateTrust);
            document.getElementById('transaction-type').addEventListener('change', calculateTrust);
        });