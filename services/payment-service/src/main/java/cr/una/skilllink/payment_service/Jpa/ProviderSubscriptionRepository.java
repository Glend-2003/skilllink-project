package cr.una.skilllink.payment_service.Jpa;

import cr.una.skilllink.payment_service.Entity.ProviderSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProviderSubscriptionRepository extends JpaRepository<ProviderSubscription, Long> {
    Optional<ProviderSubscription> findByProviderIdAndStatus(Long providerId, ProviderSubscription.SubscriptionStatus status);
}
