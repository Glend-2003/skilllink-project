package cr.una.skilllink.payment_service.Services;

import cr.una.skilllink.payment_service.Dto.SubscriptionRequestDto;
import cr.una.skilllink.payment_service.Entity.*;
import cr.una.skilllink.payment_service.Jpa.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.paypal.api.payments.Payment;
import com.paypal.api.payments.PaymentExecution;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;

@Service
public class PaymentService {

    @Autowired
    private SubscriptionPlanRepository planRepository;

    @Autowired
    private ProviderSubscriptionRepository subscriptionRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private APIContext apiContext;

    @Transactional
    public ProviderSubscription subscribeProvider(SubscriptionRequestDto request) {
        SubscriptionPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("Plan no encontrado"));
        
        boolean paymentSuccess = processPayPalPayment(request.getPaymentToken());

        if (!paymentSuccess) {
            throw new RuntimeException("El pago con PayPal no se pudo completar.");
        }

        Transaction transaction = new Transaction();
        transaction.setPayerUserId(request.getProviderId());
        transaction.setPayeeUserId(null); 
        transaction.setTransactionType(Transaction.TransactionType.subscription);
        
        transaction.setAmount(plan.getPrice());
        transaction.setCommissionAmount(BigDecimal.ZERO); 
        transaction.setNetAmount(plan.getPrice());
        
        transaction.setCurrency("CRC");
        transaction.setPaymentMethod(request.getPaymentMethod());
        transaction.setPaymentStatus(Transaction.PaymentStatus.completed);
        transaction.setExternalTransactionId(UUID.randomUUID().toString());
        transaction.setCompletedAt(LocalDateTime.now());
        
        transaction = transactionRepository.save(transaction);

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = calculateEndDate(startDate, plan.getBillingCycle());

        subscriptionRepository.findByProviderIdAndStatus(request.getProviderId(), ProviderSubscription.SubscriptionStatus.active)
                .ifPresent(oldSub -> {
                    oldSub.setStatus(ProviderSubscription.SubscriptionStatus.cancelled);
                    oldSub.setCancelledAt(LocalDateTime.now());
                    oldSub.setAutoRenew(false);
                    subscriptionRepository.save(oldSub);
                });

        ProviderSubscription newSub = new ProviderSubscription();
        newSub.setProviderId(request.getProviderId());
        newSub.setPlan(plan);
        newSub.setStartDate(startDate);
        newSub.setEndDate(endDate);
        newSub.setStatus(ProviderSubscription.SubscriptionStatus.active);
        newSub.setAutoRenew(true);

        ProviderSubscription savedSub = subscriptionRepository.save(newSub);

        transaction.setSubscriptionId(savedSub.getSubscriptionId());
        transactionRepository.save(transaction);

        return savedSub;
    }

    private boolean processPayPalPayment(String paymentTokenCombined) {
        try {
            String[] parts = paymentTokenCombined.split(",");
            if (parts.length != 2) return false;

            String paymentId = parts[0];
            String payerId = parts[1];

            Payment payment = new Payment();
            payment.setId(paymentId);

            PaymentExecution paymentExecute = new PaymentExecution();
            paymentExecute.setPayerId(payerId);

            Payment executedPayment = payment.execute(apiContext, paymentExecute);

            if ("approved".equals(executedPayment.getState())) {
                System.out.println("Pago PayPal exitoso. ID: " + executedPayment.getId());
                return true;
            } else {
                System.out.println("Pago no aprobado. Estado: " + executedPayment.getState());
                return false;
            }

        } catch (PayPalRESTException e) {
            System.err.println("Error en PayPal: " + e.getMessage());
            return false;
        }
    }

    public List<SubscriptionPlan> getAllPlans() {
        return planRepository.findAll();
    }

    public List<Transaction> getTransactionsByUser(Long userId) {
        return transactionRepository.findByPayerUserId(userId);
    }

    private LocalDate calculateEndDate(LocalDate start, SubscriptionPlan.BillingCycle cycle) {
        if (cycle == null) return start.plusMonths(1);

        switch (cycle) {
            case monthly: return start.plusMonths(1);
            case quarterly: return start.plusMonths(3);
            case yearly: return start.plusYears(1);
            default: return start.plusMonths(1);
        }
    }

    private boolean processPaymentGateway(SubscriptionRequestDto request, BigDecimal amount) {
        return true; 
    }
}
