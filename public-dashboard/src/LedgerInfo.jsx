import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

function LedgerInfo() {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      // --- Crazier Animations ---

      // 1. Animate the main header (h2)
      // We'll make it "fly in" from the top and bounce
      gsap.from("h2", {
        duration: 1.2,
        y: -100,
        opacity: 0,
        ease: "elastic.out(1, 0.5)" // A fun bouncy ease
      });

      // 2. Animate the intro paragraph
      gsap.from("p", {
        duration: 1,
        x: -50,
        opacity: 0,
        delay: 0.3,
        ease: "power3.out"
      });

      // 3. Set the initial state of the cards (invisible and flipped)
      gsap.set(".concept-card", {
        opacity: 0,
        rotationY: -90, // Flipped on their side
        transformOrigin: "left center", // Flip from the left edge
        perspective: 800 // Adds the 3D depth
      });

      // 4. Animate the cards in with a cool 3D flip
      gsap.to(".concept-card", {
        duration: 0.8,
        opacity: 1,
        rotationY: 0,
        ease: "power4.out",
        stagger: 0.2, // Stagger them one by one
        delay: 0.6     // Start after the header
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="ledger-info-container" ref={containerRef}>
      <h2>Behind the "TransparentFlow"</h2>
      <p>
        This isn't just a standard database. Our entire application is powered by
        a private, permissioned blockchain using "Hyperledger Fabric".
      </p>



      <h3>Key Concepts</h3>
      <div className="concepts-grid">
        <div className="concept-card">
          <h4>🛡️ Immutable Ledger</h4>
          <p>
            Every transaction (creating a project, releasing a payment, logging a flag)
            is permanently recorded. It "cannot be altered or deleted". This provides a
            perfect, unchangeable audit trail for all parties.
          </p>
        </div>
        <div className="concept-card">
          <h4>🔑 Role-Based Identity</h4>
          <p>
            Users are not just "usernames." Each user has a unique cryptographic
            certificate (X.509) that defines their "organization (Org1/Org2)" and
            their "role (gov_admin, contractor)".
          </p>
        </div>
        <div className="concept-card">
          <h4>📝 Smart Contracts (Chaincode)</h4>
          <p>
            Our "business logic" lives on the blockchain itself as a Smart Contract.
            The code enforces the rules—like "only an admin can flag" or "do not pay
            if flagged"—autonomously.
          </p>
        </div>
        <div className="concept-card">
          <h4>🔒 Data Privacy</h4>
          <p>
            As a permissioned network, this ledger is "not public". Only members
            (like the Government Org and the Contractor Org) are allowed to
            participate, ensuring all data remains confidential.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LedgerInfo;